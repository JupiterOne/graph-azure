import { AzureWebLinker } from '../../../azure';
import { ContainerServiceModels } from '@azure/arm-containerservice';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { ContainerServicesEntities } from './constants';

export function createClusterEntitiy(
  webLinker: AzureWebLinker,
  data: ContainerServiceModels.ManagedCluster,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: ContainerServicesEntities.SERVICE._type,
        _class: ContainerServicesEntities.SERVICE._class,
        id: data.id,
        name: data.name,
        skuName: data.sku?.name,
        location: data.location,
        principalId: data.identity?.principalId,
        tenantId: data.identity?.tenantId,
        provisioningState: data.provisioningState,
        maxAgentPools: data.maxAgentPools,
        kubernetesVersion: data.kubernetesVersion,
        dnsPrefix: data.dnsPrefix,
        fqdn: data.fqdn,
        nodeResourceGroup: data.nodeResourceGroup,
        // 8.5 Enable RBAC within Azure Kubernetes Clusters
        enableRBAC: data.enableRBAC,
        enablePodSecurityPolicy: data.enablePodSecurityPolicy,
        disableLocalAccounts: data.disableLocalAccounts,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
