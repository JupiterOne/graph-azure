import { AzureWebLinker } from '../../../azure';
import { ManagedCluster } from '@azure/arm-containerservice';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import {
  ContainerServicesEntities,
  Entities,
  KubernetesServiceEntityProperties,
} from './constants';
import {
  MaintenanceConfiguration,
  TrustedAccessRoleBinding,
  TrustedAccessRole,
} from '@azure/arm-containerservice/src/models';

export function getKubernetesServiceKey(kubernetesServiceId) {
  return 'azure_kube_service:' + kubernetesServiceId;
}

export function getAccessRoleKey(name, location) {
  return `azure_access_role_${name}_location_${location} `;
}

export function createClusterEntity(
  webLinker: AzureWebLinker,
  data: ManagedCluster,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: ContainerServicesEntities.KUBERNETES_CLUSTER._type,
        _class: ContainerServicesEntities.KUBERNETES_CLUSTER._class,
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
        enableRBAC: data.enableRbac,
        enablePodSecurityPolicy: data.enablePodSecurityPolicy,
        disableLocalAccounts: data.disableLocalAccounts,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createMaintenanceConfigurationsEntity(
  webLinker: AzureWebLinker,
  data: MaintenanceConfiguration,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: Entities.MAINTENANCE_CONFIGURATION._type,
        _class: Entities.MAINTENANCE_CONFIGURATION._class,
        id: data.id,
        name: data.name,
        systemData: data.systemData?.toString(),
        timeInWeek: data.timeInWeek?.toString(),
        type: data.type,
        notAllowedTime: data.notAllowedTime?.toString(),
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createAccessRoleEntity(
  webLinker: AzureWebLinker,
  data: TrustedAccessRole,
  locationName,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getAccessRoleKey(data.name!, locationName),
        _type: Entities.ACCESS_ROLE._type,
        _class: Entities.ACCESS_ROLE._class,
        name: data.name,
        // rules: data.rules?.toString(),
        sourceResourceType: data.sourceResourceType,
        webLink: webLinker.portalResourceUrl(data.name),
      },
    },
  });
}

export function createRoleBindingEntity(
  webLinker: AzureWebLinker,
  data: TrustedAccessRoleBinding,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: Entities.ROLE_BINDING._type,
        _class: Entities.ROLE_BINDING._class,
        id: data.id,
        name: data.name,
        provisioningState: data.provisioningState,
        roles: data.roles,
        sourceResourceId: data.sourceResourceId,
        createdAt: data.systemData?.createdAt?.toString(),
        createdBy: data.systemData?.createdBy,
        createdByType: data.systemData?.createdByType,
        lastModifiedAt: data.systemData?.lastModifiedAt?.toString(),
        lastModifiedBy: data.systemData?.lastModifiedBy,
        lastModifiedByType: data.systemData?.lastModifiedByType,
        type: data.type,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createKubernetesServiceEntity(
  integrationInstance: MaintenanceConfiguration,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: integrationInstance,
      assign: {
        _key: getKubernetesServiceKey(integrationInstance.id),
        _type: Entities.KUBERNETES_SERVICE._type,
        _class: Entities.KUBERNETES_SERVICE._class,
        ...KubernetesServiceEntityProperties,
      },
    },
  });
}
