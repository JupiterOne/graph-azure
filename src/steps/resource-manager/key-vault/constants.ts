import { RelationshipClass } from '@jupiterone/integration-sdk-core';

import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';

export const steps = {
  VAULTS: 'rm-keyvault-vaults',
  VAULT_DIAGNOSTIC_SETTINGS: 'rm-keyvault-diagnostic-settings',
  KEYS: 'rm-keyvault-keys',
};

export const entities = {
  KEY_VAULT: {
    _type: 'azure_keyvault_service',
    _class: ['Service'],
    resourceName: '[RM] Key Vault',
    diagnosticLogCategories: ['AuditEvent'],
  },
  KEY: {
    _type: 'azure_keyvault_key',
    _class: ['Key'],
    resourceName: '[RM] Key Vault Key',
    schema: {},
  },
};

export const relationships = {
  ACCOUNT_HAS_KEY_VAULT: {
    _type: 'azure_account_has_keyvault_service',
    sourceType: ACCOUNT_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: entities.KEY_VAULT._type,
  },
  KEY_VAULT_HAS_KEY: {
    _type: 'azure_keyvault_service_has_key',
    sourceType: entities.KEY_VAULT._type,
    _class: RelationshipClass.HAS,
    targetType: entities.KEY._type,
  },
};
