import forEach from "lodash.foreach";
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
  RelationshipFromIntegration,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  AzureWebLinker,
  createAzureWebLinker,
  ResourceManagerClient,
} from "../azure";
import {
  createNetworkInterfaceEntity,
  createNetworkSecurityGroupEntity,
  createNetworkSecurityGroupSubnetRelationship,
  createPublicIPAddressEntity,
  createSubnetEntity,
  createVirtualMachineEntity,
  createVirtualMachineNetworkInterfaceRelationship,
  createVirtualMachinePublicIPAddressRelationship,
  createVirtualNetworkEntity,
  createVirtualNetworkSubnetRelationship,
} from "../converters";
import {
  AccountEntity,
  NETWORK_INTERFACE_ENTITY_TYPE,
  NetworkInterfaceEntity,
  PUBLIC_IP_ADDRESS_ENTITY_TYPE,
  PublicIPAddressEntity,
  SECURITY_GROUP_ENTITY_TYPE,
  SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE,
  SUBNET_ENTITY_TYPE,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VIRTUAL_MACHINE_NETWORK_INTERFACE_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
  VIRTUAL_NETWORK_ENTITY_TYPE,
  VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE,
  VirtualMachineEntity,
  VirtualMachineNetworkInterfaceRelationship,
  VirtualMachinePublicIPAddressRelationship,
} from "../jupiterone";
import { AzureExecutionContext } from "../types";

export default async function synchronizeComputeResources(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, azrm } = executionContext;
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize groups",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);

  const operationResults: PersisterOperationsResult[] = [
    await synchronizeNetworkResources(executionContext, webLinker),
  ];

  const [oldAddresses, newAddresses] = await Promise.all([
    graph.findEntitiesByType(PUBLIC_IP_ADDRESS_ENTITY_TYPE),
    fetchPublicIPAddresses(azrm, webLinker),
  ]);

  const [oldNics, newNics] = await Promise.all([
    graph.findEntitiesByType(NETWORK_INTERFACE_ENTITY_TYPE),
    fetchNetworkInterfaces(azrm, webLinker),
  ]);

  forEach(newNics, nic => {
    const nicData = getRawData(nic) as NetworkInterface;
    const publicIp: string[] = [];
    forEach(nicData.ipConfigurations, c => {
      const ipAddress = newAddresses.find(
        i => i._key === (c.publicIPAddress && c.publicIPAddress.id),
      );
      if (ipAddress && ipAddress.publicIp) {
        publicIp.push(ipAddress.publicIp);
      }
    });
    nic.publicIp = publicIp;
    nic.publicIpAddress = publicIp;
  });

  const [oldVms, newVms] = await Promise.all([
    graph.findEntitiesByType(VIRTUAL_MACHINE_ENTITY_TYPE),
    fetchVirtualMachines(azrm, webLinker),
  ]);

  const newVMNicRelationships: VirtualMachineNetworkInterfaceRelationship[] = [];
  const newVMAddressRelationships: VirtualMachinePublicIPAddressRelationship[] = [];

  forEach(newVms, vm => {
    const vmData = getRawData(vm) as VirtualMachine;
    const nicData = findNetworkInterfacesForVM(
      vmData,
      newNics.map(e => getRawData(e)),
    );
    forEach(nicData, nic => {
      newVMNicRelationships.push(
        createVirtualMachineNetworkInterfaceRelationship(vmData, nic),
      );
      forEach(nic.ipConfigurations, c => {
        if (c.publicIPAddress) {
          newVMAddressRelationships.push(
            createVirtualMachinePublicIPAddressRelationship(
              vmData,
              c.publicIPAddress,
            ),
          );
        }
      });
    });
  });

  const [oldVMNicRelationships, oldVMAddressRelationships] = await Promise.all([
    graph.findRelationshipsByType(
      VIRTUAL_MACHINE_NETWORK_INTERFACE_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType(
      VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
    ),
  ]);

  operationResults.push(
    await persister.publishPersisterOperations([
      [
        ...persister.processEntities(oldAddresses, newAddresses),
        ...persister.processEntities(oldNics, newNics),
        ...persister.processEntities(oldVms, newVms),
      ],
      [
        ...persister.processRelationships(
          oldVMNicRelationships,
          newVMNicRelationships,
        ),
        ...persister.processRelationships(
          oldVMAddressRelationships,
          newVMAddressRelationships,
        ),
      ],
    ]),
  );

  return {
    operations: summarizePersisterOperationsResults(...operationResults),
  };
}

async function synchronizeNetworkResources(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
): Promise<PersisterOperationsResult> {
  const { graph, persister, azrm } = executionContext;

  const [oldVirtualNetworks, newVirtualNetworks] = await Promise.all([
    graph.findEntitiesByType(VIRTUAL_NETWORK_ENTITY_TYPE),
    fetchVirtualNetworks(azrm, webLinker),
  ]);

  const [
    oldSecurityGroups,
    oldSecurityGroupSubnetRelationships,
    newSecurityGroups,
  ] = await Promise.all([
    graph.findEntitiesByType(SECURITY_GROUP_ENTITY_TYPE),
    graph.findRelationshipsByType(SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE),
    fetchNetworkSecurityGroups(azrm, webLinker),
  ]);

  const [oldSubnets, oldVnetSubnetRelationships] = await Promise.all([
    graph.findEntitiesByType(SUBNET_ENTITY_TYPE),
    graph.findRelationshipsByType(VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE),
  ]);

  const subnetSecurityGroupMap = newSecurityGroups.reduce(
    (m: { [subnetId: string]: NetworkSecurityGroup }, e) => {
      const sg = getRawData(e) as NetworkSecurityGroup;
      if (sg.subnets) {
        for (const s of sg.subnets) {
          m[s.id as string] = sg;
        }
      }
      return m;
    },
    {},
  );

  const newSubnets: EntityFromIntegration[] = [];
  const newVnetSubnetRelationships: RelationshipFromIntegration[] = [];
  const newSecurityGroupSubnetRelationships: RelationshipFromIntegration[] = [];

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

  return persister.publishPersisterOperations([
    [
      ...persister.processEntities(oldVirtualNetworks, newVirtualNetworks),
      ...persister.processEntities(oldSecurityGroups, newSecurityGroups),
      ...persister.processEntities(oldSubnets, newSubnets),
    ],
    [
      ...persister.processRelationships(
        oldVnetSubnetRelationships,
        newVnetSubnetRelationships,
      ),
      ...persister.processRelationships(
        oldSecurityGroupSubnetRelationships,
        newSecurityGroupSubnetRelationships,
      ),
    ],
  ]);
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
    );
  }
  return vmNics;
}
