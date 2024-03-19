import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import { Workspace, SqlPool } from '@azure/arm-synapse';
import { SynapseEntities } from './constant';

export function getSynapseServiceKey(uniqueId: string) {
  return `${SynapseEntities.SYNAPSE_SERVICE._type}:${uniqueId}`;
}

export function getSynapseWorkspaceKey(uniqueId: string) {
  return `${SynapseEntities.WORKSPACE._type}:${uniqueId}`;
}

export function getSynapseSQLKey(uniqueId: string) {
  return `${SynapseEntities.SYNAPSE_SQL_POOL._type}:${uniqueId}`;
}

function getResourceGroupName(id: string) {
  return id.split('/')[4];
}

export function createWorkspaceEntity(
  webLinker: AzureWebLinker,
  data: Workspace,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getSynapseWorkspaceKey(data.workspaceUID as string),
        _type: SynapseEntities.WORKSPACE._type,
        _class: SynapseEntities.WORKSPACE._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
        type: data.type,
        resourceGroupName: getResourceGroupName(data.id as string),
      },
    },
  });
}

/**
 * create Synapse service entity.
 * @returns  Synapse Entity
 */
export function createSynapseServiceEntity(instnaceId: string): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: getSynapseServiceKey(instnaceId),
        _type: SynapseEntities.SYNAPSE_SERVICE._type,
        _class: SynapseEntities.SYNAPSE_SERVICE._class,
        name: SynapseEntities.SYNAPSE_SERVICE.resourceName,
        category: ['Analysis'],
        function: ['Analysis'],
        endpoint: 'https://portal.azure.com',
      },
    },
  });
}

export function createSqlPoolEntity(webLinker: AzureWebLinker, data: SqlPool) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getSynapseSQLKey(data.id as string),
        _type: SynapseEntities.SYNAPSE_SQL_POOL._type,
        _class: SynapseEntities.SYNAPSE_SQL_POOL._class,
        id: data.id,
        name: data.name,
        type: data.type,
        location: data.location,
        collection: data.collation,
        status: data.status,
        createdDate: data.creationDate?.toLocaleDateString(),
        storageAccountType: data.storageAccountType,
        provisioningState: data.provisioningState,
        maxSizebytes: data.maxSizeBytes,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
