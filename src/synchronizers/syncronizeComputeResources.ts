import map from "lodash.map";

import { VirtualMachine } from "@azure/arm-compute/esm/models";
import {
  NetworkInterface,
  NetworkSecurityGroup,
  VirtualNetwork,
} from "@azure/arm-network/esm/models";
import {
  EntityFromIntegration,
  getRawData,
  IntegrationError,
  IntegrationExecutionResult,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
  IntegrationRelationship,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  AzureWebLinker,
  createAzureWebLinker,
  ResourceManagerClient,
} from "../azure";
import {
  createNetworkInterfaceEntity,
  createNetworkSecurityGroupEntity,
  createNetworkSecurityGroupNicRelationship,
  createNetworkSecurityGroupSubnetRelationship,
  createPublicIPAddressEntity,
  createSubnetEntity,
  createVirtualMachineEntity,
  createVirtualMachineNetworkInterfaceRelationship,
  createVirtualMachinePublicIPAddressRelationship,
  createVirtualNetworkEntity,
  createVirtualNetworkSubnetRelationship,
  createSubnetVirtualMachineRelationship,
  createImageEntity,
  createDiskEntity,
  createVirtualMachineDiskRelationships,
} from "../converters";
import {
  AccountEntity,
  NETWORK_INTERFACE_ENTITY_TYPE,
  NetworkInterfaceEntity,
  PUBLIC_IP_ADDRESS_ENTITY_TYPE,
  PublicIPAddressEntity,
  SECURITY_GROUP_ENTITY_TYPE,
  SECURITY_GROUP_NIC_RELATIONSHIP_TYPE,
  SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE,
  SUBNET_ENTITY_TYPE,
  SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
  VIRTUAL_NETWORK_ENTITY_TYPE,
  VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE,
  VirtualMachineEntity,
  AzureRegionalEntity,
  VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE,
  SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
} from "../jupiterone";
import { AzureExecutionContext } from "../types";
import {
  isWideOpen,
  createSecurityGroupRuleRelationships,
} from "../converters/securityGroups";

type NetworkSynchronizationResults = {
  operationsResult: PersisterOperationsResult;
  nics: NetworkInterface[];
};

export default async function synchronizeComputeResources(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, azrm } = executionContext;
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize compute resources",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);

  const networkResults = await synchronizeNetworkResources(
    executionContext,
    webLinker,
  );

  const [oldVms, newVms] = (await Promise.all([
    graph.findEntitiesByType(VIRTUAL_MACHINE_ENTITY_TYPE),
    fetchVirtualMachines(azrm, webLinker),
  ])) as [EntityFromIntegration[], VirtualMachineEntity[]];

  const [oldImages, newImages] = await Promise.all([
    graph.findEntitiesByType(VIRTUAL_MACHINE_ENTITY_TYPE),
    fetchVirtualMachineImages(azrm, webLinker),
  ]);

  const [oldDisks, newDisks] = await Promise.all([
    graph.findEntitiesByType(VIRTUAL_MACHINE_ENTITY_TYPE),
    fetchVirtualMachineDisks(azrm, webLinker),
  ]);

  const newSubnetVmRelationships: IntegrationRelationship[] = [];
  const newVMNicRelationships: IntegrationRelationship[] = [];
  const newVMAddressRelationships: IntegrationRelationship[] = [];
  const newVMDiskRelationships: IntegrationRelationship[] = [];

  for (const vm of newVms) {
    const vmData = getRawData(vm) as VirtualMachine;
    const nicData = findNetworkInterfacesForVM(vmData, networkResults.nics);
    for (const nic of nicData) {
      newVMNicRelationships.push(
        createVirtualMachineNetworkInterfaceRelationship(vmData, nic),
      );
      for (const c of nic.ipConfigurations || []) {
        if (c.subnet) {
          newSubnetVmRelationships.push(
            createSubnetVirtualMachineRelationship(c.subnet, vmData),
          );
        }
        if (c.publicIPAddress) {
          newVMAddressRelationships.push(
            createVirtualMachinePublicIPAddressRelationship(
              vmData,
              c.publicIPAddress,
            ),
          );
        }
      }
    }

    if (vmData.storageProfile) {
      newVMDiskRelationships.push(
        ...createVirtualMachineDiskRelationships(vmData),
      );
    }
  }

  const [
    oldSubnetVmRelationships,
    oldVMNicRelationships,
    oldVMAddressRelationships,
    oldVMDiskRelationships,
  ] = await Promise.all([
    graph.findRelationshipsByType(SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(
      VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType(VIRTUAL_MACHINE_DISK_RELATIONSHIP_TYPE),
  ]);

  // This has been changed to "azure_vm_uses_nic"
  const DEPRECATED_VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE =
    "azure_vm_uses_network_interface";

  oldVMNicRelationships.push(
    ...(await graph.findRelationshipsByType(
      DEPRECATED_VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
    )),
  );

  const operationsResult = await persister.publishPersisterOperations([
    [
      ...persister.processEntities(oldVms, newVms),
      ...persister.processEntities(oldDisks, newDisks),
      ...persister.processEntities(oldImages, newImages),
    ],
    [
      ...persister.processRelationships(
        oldSubnetVmRelationships,
        newSubnetVmRelationships,
      ),
      ...persister.processRelationships(
        oldVMNicRelationships,
        newVMNicRelationships,
      ),
      ...persister.processRelationships(
        oldVMAddressRelationships,
        newVMAddressRelationships,
      ),
      ...persister.processRelationships(
        oldVMDiskRelationships,
        newVMDiskRelationships,
      ),
    ],
  ]);

  return {
    operations: summarizePersisterOperationsResults(
      networkResults.operationsResult,
      operationsResult,
    ),
  };
}

async function synchronizeNetworkResources(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
): Promise<NetworkSynchronizationResults> {
  const { graph, persister, azrm } = executionContext;

  const [oldVirtualNetworks, newVirtualNetworks] = (await Promise.all([
    graph.findEntitiesByType(VIRTUAL_NETWORK_ENTITY_TYPE),
    fetchVirtualNetworks(azrm, webLinker),
  ])) as [EntityFromIntegration[], EntityFromIntegration[]];

  const [oldAddresses, newAddresses] = await Promise.all([
    graph.findEntitiesByType(PUBLIC_IP_ADDRESS_ENTITY_TYPE),
    fetchPublicIPAddresses(azrm, webLinker),
  ]);

  const [oldNics, newNics] = (await Promise.all([
    graph.findEntitiesByType(NETWORK_INTERFACE_ENTITY_TYPE),
    fetchNetworkInterfaces(azrm, webLinker),
  ])) as [EntityFromIntegration[], NetworkInterfaceEntity[]];

  for (const nic of newNics) {
    const nicData = getRawData(
      nic as EntityFromIntegration,
    ) as NetworkInterface;
    const publicIp: string[] = [];
    for (const c of nicData.ipConfigurations || []) {
      const ipAddress = newAddresses.find(
        i => i._key === (c.publicIPAddress && c.publicIPAddress.id),
      ) as PublicIPAddressEntity;
      if (ipAddress && ipAddress.publicIp) {
        publicIp.push(ipAddress.publicIp);
      }
    }
    Object.assign(nic, {
      publicIp,
      publicIpAddress: publicIp,
    });
  }

  const [
    oldSecurityGroups,
    oldSecurityGroupNicRelationships,
    oldSecurityGroupSubnetRelationships,
    oldSecurityGroupRuleRelationships,
    newSecurityGroups,
  ] = (await Promise.all([
    graph.findEntitiesByType(SECURITY_GROUP_ENTITY_TYPE),
    graph.findRelationshipsByType(SECURITY_GROUP_NIC_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(SECURITY_GROUP_RULE_RELATIONSHIP_TYPE),
    fetchNetworkSecurityGroups(azrm, webLinker),
  ])) as [
    EntityFromIntegration[],
    IntegrationRelationship[],
    IntegrationRelationship[],
    IntegrationRelationship[],
    EntityFromIntegration[]
  ];

  const [oldSubnets, oldVnetSubnetRelationships] = (await Promise.all([
    graph.findEntitiesByType(SUBNET_ENTITY_TYPE),
    graph.findRelationshipsByType(VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE),
  ])) as [EntityFromIntegration[], IntegrationRelationship[]];

  const subnetSecurityGroupMap: {
    [subnetId: string]: NetworkSecurityGroup;
  } = {};
  const newSecurityGroupNicRelationships: IntegrationRelationship[] = [];
  const newSecurityGroupRuleRelationships: IntegrationRelationship[] = [];

  for (const sge of newSecurityGroups) {
    const sg = getRawData(sge) as NetworkSecurityGroup;
    if (sg.subnets) {
      for (const s of sg.subnets) {
        subnetSecurityGroupMap[s.id as string] = sg;
      }
    }
    if (sg.networkInterfaces) {
      for (const i of sg.networkInterfaces) {
        newSecurityGroupNicRelationships.push(
          createNetworkSecurityGroupNicRelationship(sg, i),
        );
      }
    }

    const rules = [
      ...(sg.defaultSecurityRules || []),
      ...(sg.securityRules || []),
    ];

    Object.assign(sge, {
      wideOpen: isWideOpen(rules),
    });

    newSecurityGroupRuleRelationships.push(
      ...createSecurityGroupRuleRelationships(sg, executionContext.instance.id),
    );
  }

  const newSubnets: EntityFromIntegration[] = [];
  const newVnetSubnetRelationships: IntegrationRelationship[] = [];
  const newSecurityGroupSubnetRelationships: IntegrationRelationship[] = [];

  for (const vnetEntity of newVirtualNetworks) {
    const vnet = getRawData(vnetEntity) as VirtualNetwork;
    if (vnet.subnets) {
      for (const s of vnet.subnets) {
        const subnetEntity = createSubnetEntity(webLinker, vnet, s);
        newSubnets.push(subnetEntity);
        newVnetSubnetRelationships.push(
          createVirtualNetworkSubnetRelationship(vnet, s),
        );
        const sg = subnetSecurityGroupMap[s.id as string];
        if (sg) {
          newSecurityGroupSubnetRelationships.push(
            createNetworkSecurityGroupSubnetRelationship(sg, s),
          );
        }
      }
    }
  }

  return {
    nics: newNics.map(e => getRawData(e)),
    operationsResult: await persister.publishPersisterOperations([
      [
        ...persister.processEntities(oldVirtualNetworks, newVirtualNetworks),
        ...persister.processEntities(oldSecurityGroups, newSecurityGroups),
        ...persister.processEntities(oldSubnets, newSubnets),
        ...persister.processEntities(oldAddresses, newAddresses),
        ...persister.processEntities(oldNics, newNics),
      ],
      [
        ...persister.processRelationships(
          oldVnetSubnetRelationships,
          newVnetSubnetRelationships,
        ),
        ...persister.processRelationships(
          oldSecurityGroupNicRelationships,
          newSecurityGroupNicRelationships,
        ),
        ...persister.processRelationships(
          oldSecurityGroupSubnetRelationships,
          newSecurityGroupSubnetRelationships,
        ),
        ...persister.processRelationships(
          oldSecurityGroupRuleRelationships,
          newSecurityGroupRuleRelationships,
        ),
      ],
    ]),
  };
}

async function fetchNetworkSecurityGroups(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<EntityFromIntegration[]> {
  const entities: EntityFromIntegration[] = [];
  await client.iterateNetworkSecurityGroups(e => {
    entities.push(createNetworkSecurityGroupEntity(webLinker, e));
  });
  return entities;
}

async function fetchVirtualNetworks(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<EntityFromIntegration[]> {
  const entities: EntityFromIntegration[] = [];
  await client.iterateVirtualNetworks(e => {
    entities.push(createVirtualNetworkEntity(webLinker, e));
  });
  return entities;
}

async function fetchVirtualMachines(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<VirtualMachineEntity[]> {
  const entities: VirtualMachineEntity[] = [];
  await client.iterateVirtualMachines(e => {
    entities.push(createVirtualMachineEntity(webLinker, e));
  });
  return entities;
}

async function fetchVirtualMachineImages(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<AzureRegionalEntity[]> {
  const entities: AzureRegionalEntity[] = [];
  await client.iterateVirtualMachineImages(e => {
    entities.push(createImageEntity(webLinker, e));
  });
  return entities;
}

async function fetchVirtualMachineDisks(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<AzureRegionalEntity[]> {
  const entities: AzureRegionalEntity[] = [];
  await client.iterateVirtualMachineDisks(e => {
    entities.push(createDiskEntity(webLinker, e));
  });
  return entities;
}

async function fetchNetworkInterfaces(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<NetworkInterfaceEntity[]> {
  const entities: NetworkInterfaceEntity[] = [];
  await client.iterateNetworkInterfaces(e => {
    entities.push(createNetworkInterfaceEntity(webLinker, e));
  });
  return entities;
}

async function fetchPublicIPAddresses(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<PublicIPAddressEntity[]> {
  const entities: PublicIPAddressEntity[] = [];
  await client.iteratePublicIPAddresses(e => {
    entities.push(createPublicIPAddressEntity(webLinker, e));
  });
  return entities;
}

function findNetworkInterfacesForVM(
  vm: VirtualMachine,
  nics: NetworkInterface[],
): NetworkInterface[] {
  const vmNics: NetworkInterface[] = [];
  if (vm.networkProfile) {
    map(vm.networkProfile.networkInterfaces, n =>
      nics.find(e => e.id === n.id),
    ).forEach(e => e && vmNics.push(e));
  }
  return vmNics;
}
