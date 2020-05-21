import {
  LoadBalancer,
  NetworkInterfaceIPConfiguration,
  PublicIPAddress,
} from "@azure/arm-network/esm/models";
import { Entity, Relationship } from "@jupiterone/integration-sdk";

import { createAzureWebLinker } from "../../../azure";
import { ACCOUNT_ENTITY_TYPE } from "../../../jupiterone";
import { IntegrationStepContext } from "../../../types";
import { NetworkClient } from "./client";
import {
  createLoadBalancerBackendNicRelationship,
  createLoadBalancerEntity,
  createNetworkInterfaceEntity,
  createNetworkSecurityGroupEntity,
  createNetworkSecurityGroupNicRelationship,
  createPublicIPAddressEntity,
  isWideOpen,
  createSecurityGroupRuleRelationships,
} from "./converters";

/**
 * Depends on having loaded the public IP addresses.
 */
export async function fetchNetworkInterfaces(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const publicIpAddresses = await jobState.getData<PublicIPAddress[]>(
    "publicIPAddresses",
  );

  const findPublicIPAddresses = (
    ipConfigs: NetworkInterfaceIPConfiguration[] | undefined,
  ): string[] | undefined => {
    if (ipConfigs) {
      const addressesForNIC: string[] = [];
      for (const ipConfig of ipConfigs) {
        const ipAddress = publicIpAddresses.find(
          (i) =>
            i.id === (ipConfig.publicIPAddress && ipConfig.publicIPAddress.id),
        );
        if (ipAddress && ipAddress.ipAddress) {
          addressesForNIC.push(ipAddress.ipAddress);
        }
      }
      return addressesForNIC;
    }
  };

  await client.iterateNetworkInterfaces((e) =>
    jobState.addEntity(
      createNetworkInterfaceEntity(
        webLinker,
        e,
        findPublicIPAddresses(e.ipConfigurations),
      ),
    ),
  );
}

export async function fetchPublicIPAddresses(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const publicIpAddresses: PublicIPAddress[] = [];
  await client.iteratePublicIPAddresses(async (e) => {
    publicIpAddresses.push(e);
    await jobState.addEntity(createPublicIPAddressEntity(webLinker, e));
  });

  await jobState.setData("publicIPAddresses", publicIpAddresses);
}

export async function fetchLoadBalancers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const createLoadBalancerBackendNicRelationships = (
    lb: LoadBalancer,
  ): Relationship[] | undefined => {
    if (lb.backendAddressPools) {
      const relationships: Relationship[] = [];
      lb.backendAddressPools.forEach((backend) => {
        if (backend.backendIPConfigurations) {
          backend.backendIPConfigurations.forEach((ip) => {
            if (ip.id) {
              /**
               * Need to remove the extra `/ipConfigurations/*` path from the nicId,
               * so that they can be mapped to the `_key` on the `azure_nic` entity.
               * For example:
               * "id": "/subscriptions/<uuid>/resourceGroups/xtest/providers/Microsoft.Network/networkInterfaces/j1234/ipConfigurations/ipconfig1",
               */
              const nicId = ip.id.split("/ipConfigurations")[0];
              relationships.push(
                createLoadBalancerBackendNicRelationship(lb, nicId),
              );
            }
          });
        }
      });
      return relationships;
    }
  };

  await client.iterateLoadBalancers(async (e) => {
    await jobState.addEntity(createLoadBalancerEntity(webLinker, e));
    const nicRelationships = createLoadBalancerBackendNicRelationships(e);
    if (nicRelationships) {
      await jobState.addRelationships(nicRelationships);
    }
  });
}

async function fetchNetworkSecurityGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  await client.iterateNetworkSecurityGroups(async (sg) => {
    if (sg.networkInterfaces) {
      await jobState.addRelationships(
        sg.networkInterfaces.map((i) =>
          createNetworkSecurityGroupNicRelationship(sg, i),
        ),
      );
    }

    await jobState.addRelationships(
      createSecurityGroupRuleRelationships(sg, executionContext.instance.id),
    );

    const rules = [
      ...(sg.defaultSecurityRules || []),
      ...(sg.securityRules || []),
    ];

    await jobState.addEntity(
      createNetworkSecurityGroupEntity(webLinker, sg, isWideOpen(rules)),
    );
  });
}

async function synchronizeNetworkResources(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
): Promise<NetworkSynchronizationResults> {
  const { graph, logger, persister, azrm } = executionContext;

  const results: PersisterOperationsResult[] = [];

  const [
    oldLoadBalancerBackendNicRelationships,
    oldSecurityGroups,
    oldSecurityGroupNicRelationships,
    oldSecurityGroupRuleRelationships,
    newSecurityGroups,
  ] = (await Promise.all([
    graph.findRelationshipsByType(LB_BACKEND_NIC_RELATIONSHIP_TYPE),
    graph.findEntitiesByType(SECURITY_GROUP_ENTITY_TYPE),
    graph.findRelationshipsByType(SECURITY_GROUP_NIC_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(SECURITY_GROUP_RULE_RELATIONSHIP_TYPE),
    fetchNetworkSecurityGroups(azrm, webLinker),
  ])) as [
    IntegrationRelationship[],
    EntityFromIntegration[],
    IntegrationRelationship[],
    IntegrationRelationship[],
    EntityFromIntegration[],
  ];

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

  results.push(
    await persister.publishPersisterOperations([
      [
        ...persister.processEntities(oldSecurityGroups, newSecurityGroups),
        ...persister.processEntities(oldAddresses, newAddresses),
        ...persister.processEntities(oldNics, newNics),
        ...persister.processEntities(oldLoadBalancers, newLoadBalancers),
      ],
      [
        ...persister.processRelationships(
          oldLoadBalancerBackendNicRelationships,
          newLoadBalancerBackendNicRelationships,
        ),
        ...persister.processRelationships(
          oldSecurityGroupNicRelationships,
          newSecurityGroupNicRelationships,
        ),
        ...persister.processRelationships(
          oldSecurityGroupRuleRelationships,
          newSecurityGroupRuleRelationships,
        ),
      ],
    ]),
  );

  const newVirtualNetworks = await fetchVirtualNetworks(
    logger,
    azrm,
    webLinker,
  );
  if (newVirtualNetworks) {
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

    const [
      oldSubnets,
      oldVirtualNetworks,
      oldVnetSubnetRelationships,
      oldSecurityGroupSubnetRelationships,
    ] = (await Promise.all([
      graph.findEntitiesByType(SUBNET_ENTITY_TYPE),
      graph.findEntitiesByType(VIRTUAL_NETWORK_ENTITY_TYPE),
      graph.findRelationshipsByType(VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE),
      graph.findRelationshipsByType(SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE),
    ])) as [
      EntityFromIntegration[],
      EntityFromIntegration[],
      IntegrationRelationship[],
      IntegrationRelationship[],
    ];

    results.push(
      await persister.publishPersisterOperations([
        [
          ...persister.processEntities(oldVirtualNetworks, newVirtualNetworks),
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
      ]),
    );
  }

  return {
    nics: newNics.map((e) => getRawData(e)),
    operationsResult: summarizePersisterOperationsResults(...results),
  };
}
