import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { MonitorEntities } from '../monitor/constants';

// Step IDs
export const STEP_RM_KEYVAULT_VAULTS = 'rm-keyvault-vaults';

// Graph objects
export const KEY_VAULT_SERVICE_ENTITY_TYPE = 'azure_keyvault_service';
export const KEY_VAULT_SERVICE_ENTITY_CLASS = ['Service'];

export const ACCOUNT_KEY_VAULT_RELATIONSHIP_CLASS = RelationshipClass.HAS;
export const ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE = generateRelationshipType(
  ACCOUNT_KEY_VAULT_RELATIONSHIP_CLASS,
  ACCOUNT_ENTITY_TYPE,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
);

export const KeyVaultRelationships = {
  KEY_VAULT_HAS_MONITOR_DIAGNOSTIC_LOG_SETTING: {
    _type: 'azure_keyvault_service_has_diagnostic_log_setting',
    sourceType: KEY_VAULT_SERVICE_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type
  },

  KEY_VAULT_HAS_MONITOR_DIAGNOSTIC_METRIC_SETTING: {
    _type: 'azure_keyvault_service_has_diagnostic_metric_setting',
    sourceType: KEY_VAULT_SERVICE_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type
  }
}