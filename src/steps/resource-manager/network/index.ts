import {
  LoadBalancer,
  NetworkInterfaceIPConfiguration,
  NetworkSecurityGroup,
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
  createNetworkSecurityGroupSubnetRelationship,
  createPublicIPAddressEntity,
  createSecurityGroupRuleRelationships,
  createSubnetEntity,
  createVirtualNetworkEntity,
  createVirtualNetworkSubnetRelationship,
  isWideOpen,
} from "./converters";

type SubnetSecurityGroupMap = {
  [subnetId: string]: NetworkSecurityGroup;
};

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

  // A simple way to make the set available to dependent steps. Assumes dataset
  // is relatively small. Ideally, we could easily find the stored entity by any
  // property.
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

export async function fetchNetworkSecurityGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const subnetSecurityGroupMap: SubnetSecurityGroupMap = {};

  await client.iterateNetworkSecurityGroups(async (sg) => {
    if (sg.networkInterfaces) {
      await jobState.addRelationships(
        sg.networkInterfaces.map((i) =>
          createNetworkSecurityGroupNicRelationship(sg, i),
        ),
      );
    }

    if (sg.subnets) {
      for (const s of sg.subnets) {
        subnetSecurityGroupMap[s.id as string] = sg;
      }
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

  await jobState.setData("subnetSecurityGroupMap", subnetSecurityGroupMap);
}

export async function fetchVirtualNetworks(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new NetworkClient(instance.config, logger);

  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const subnetSecurityGroupMap = await jobState.getData<SubnetSecurityGroupMap>(
    "subnetSecurityGroupMap",
  );

  await client.iterateVirtualNetworks(async (vnet) => {
    if (vnet.subnets) {
      const subnetEntities: Entity[] = [];
      const subnetRelationships: Relationship[] = [];
      for (const subnet of vnet.subnets) {
        const subnetEntity = createSubnetEntity(webLinker, vnet, subnet);
        subnetEntities.push(subnetEntity);
        subnetRelationships.push(
          createVirtualNetworkSubnetRelationship(vnet, subnet),
        );
        const sg = subnetSecurityGroupMap[subnet.id as string];
        if (sg) {
          subnetRelationships.push(
            createNetworkSecurityGroupSubnetRelationship(sg, subnet),
          );
        }
      }
      await jobState.addEntities(subnetEntities);
      await jobState.addRelationships(subnetRelationships);
    }
    await jobState.addEntity(createVirtualNetworkEntity(webLinker, vnet));
  });
}
