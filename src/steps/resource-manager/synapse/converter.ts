import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import {
  Workspace,
  SqlPool,
  DataMaskingPolicy,
  DataMaskingRule,
  Key,
} from '@azure/arm-synapse';
import { SynapseEntities } from './constant';
import { generateEntityKey } from '../../../utils/generateKeys';

// If uniqueId is undefined or not of correct type, raise error
const validateUniqeId = generateEntityKey;

export function getSynapseEntityKey(uniqueId: string, entityType: string) {
  validateUniqeId(uniqueId);
  return `${entityType}:${uniqueId}`;
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
        _key: getSynapseEntityKey(
          data.workspaceUID as string,
          SynapseEntities.WORKSPACE._type,
        ),
        _type: SynapseEntities.WORKSPACE._type,
        _class: SynapseEntities.WORKSPACE._class,
        id: data.id,
        workspaceUID: data.workspaceUID,
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
        _key: getSynapseEntityKey(
          instnaceId,
          SynapseEntities.SYNAPSE_SERVICE._type,
        ),
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

export function createSqlPoolEntity(
  webLinker: AzureWebLinker,
  data: SqlPool,
  workspaceUID: string,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getSynapseEntityKey(
          data.id as string,
          SynapseEntities.SYNAPSE_SQL_POOL._type,
        ),
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
        workspaceUID: workspaceUID,
      },
    },
  });
}

export function createSynapseKeyEntity(
  webLinker: AzureWebLinker,
  data: Key,
  workspaceUID: string,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getSynapseEntityKey(
          data.id as string,
          SynapseEntities.SYNAPSE_KEYS._type,
        ),
        _type: SynapseEntities.SYNAPSE_KEYS._type,
        _class: SynapseEntities.SYNAPSE_KEYS._class,
        id: data.id,
        name: data.name,
        type: data.type,
        isActiveCMK: data.isActiveCMK,
        keyVaultUrl: data.keyVaultUrl,
        webLink: webLinker.portalResourceUrl(data.id),
        workspaceUID: workspaceUID,
      },
    },
  });
}

export function createDataMaskingPolicyEntity(
  webLinker: AzureWebLinker,
  data: DataMaskingPolicy,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getSynapseEntityKey(
          data.id as string,
          SynapseEntities.SYNAPSE_DATA_MASKING_POLICY._type,
        ),
        _type: SynapseEntities.SYNAPSE_DATA_MASKING_POLICY._type,
        _class: SynapseEntities.SYNAPSE_DATA_MASKING_POLICY._class,
        id: data.id,
        name: data.name,
        type: data.type,
        location: data.location,
        webLink: webLinker.portalResourceUrl(data.id),
        dataMaskingState: data.dataMaskingState,
        applicationPrincipals: data.applicationPrincipals,
        exemptPrincipals: data.exemptPrincipals,
        maskingLevel: data.maskingLevel,
        managedBy: data.managedBy,
        kind: data.kind,
      },
    },
  });
}

export function createDataMaskingRuleEntity(
  webLinker: AzureWebLinker,
  data: DataMaskingRule,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getSynapseEntityKey(
          `${data.id!}:${data.idPropertiesId!}`,
          SynapseEntities.SYNAPSE_DATA_MASKING_RULE._type,
        ),
        _type: SynapseEntities.SYNAPSE_DATA_MASKING_RULE._type,
        _class: SynapseEntities.SYNAPSE_DATA_MASKING_RULE._class,
        id: data.id,
        name: data.name || 'unknown',
        displayName: data.name || 'unknown',
        type: data.type,
        location: data.location,
        webLink: webLinker.portalResourceUrl(data.id),
        kind: data.kind,
        idPropertiesId: data.idPropertiesId,
        aliasName: data.aliasName,
        ruleState: data.ruleState,
        schemaName: data.schemaName,
        tableName: data.tableName,
        columnName: data.columnName,
        maskingFunction: data.maskingFunction,
        numberFrom: data.numberFrom,
        numberTo: data.numberTo,
        prefixSize: data.prefixSize,
        suffixSize: data.suffixSize,
        replacementString: data.replacementString,
      },
    },
  });
}
