import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
import { ANY_PRINCIPAL } from '../constants';

// Step IDs
export const STEP_RM_KEYVAULT_VAULTS = 'rm-keyvault-vaults';

export const KeyVaultStepIds = {
  KEY_VAULT_PRINCIPAL_RELATIONSHIPS: 'rm-keyvault-principal-relationships',
};

export const STEP_RM_KEYVAULT_KEYS = 'rm-keyvault-keys';

export const STEP_RM_KEYVAULT_SECRETS = 'rm-keyvault-secrets';

// Graph objects
export const KEY_VAULT_SERVICE_ENTITY_TYPE = 'azure_keyvault_service';
export const KEY_VAULT_SERVICE_ENTITY_CLASS = ['Service'];

export const KEY_VAULT_KEY_ENTITY_TYPE = 'azure_keyvault_key';
export const KEY_VAULT_KEY_ENTITY_CLASS = ['Key'];

export const KEY_VAULT_SECRET_ENTITY_TYPE = 'azure_keyvault_secret';
export const KEY_VAULT_SECRET_ENTITY_CLASS = ['Secret'];

export const KeyVaultEntities = {
  KEY_VAULT: {
    _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
    _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
    resourceName: '[RM] Key Vault',
    diagnosticLogCategories: ['AuditEvent'],
  },
  KEY_VAULT_KEY: {
    _type: KEY_VAULT_KEY_ENTITY_TYPE,
    _class: KEY_VAULT_KEY_ENTITY_CLASS,
    resourceName: '[RM] Key Vault Key',
    diagnosticLogCategories: ['AuditEvent'],
  },
  KEY_VAULT_SECRET: {
    _type: KEY_VAULT_SECRET_ENTITY_TYPE,
    _class: KEY_VAULT_SECRET_ENTITY_CLASS,
    resourceName: '[RM] Key Vault Secret',
    diagnosticLogCategories: ['AuditEvent'],
  },
};

export const ACCOUNT_KEY_VAULT_RELATIONSHIP_CLASS = RelationshipClass.HAS;
export const ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE = generateRelationshipType(
  ACCOUNT_KEY_VAULT_RELATIONSHIP_CLASS,
  ACCOUNT_ENTITY_TYPE,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
);

export const KEY_VAULT_KEY_RELATIONSHIP_TYPE = generateRelationshipType(
  RelationshipClass.CONTAINS,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  KEY_VAULT_KEY_ENTITY_TYPE,
);

export const KEY_VAULT_SECRET_RELATIONSHIP_TYPE = generateRelationshipType(
  RelationshipClass.CONTAINS,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  KEY_VAULT_SECRET_ENTITY_TYPE,
);

export const KeyVaultRelationships = {
  KEY_VAULT_ALLOWS_PRINCIPAL: {
    _type: 'azure_keyvault_service_allows_principal',
    sourceType: KeyVaultEntities.KEY_VAULT._type,
    _class: RelationshipClass.ALLOWS,
    targetType: ANY_PRINCIPAL,
  },
  KEY_VAULT_CONTAINS_KEY: {
    _type: KEY_VAULT_KEY_RELATIONSHIP_TYPE,
    sourceType: KeyVaultEntities.KEY_VAULT._type,
    _class: RelationshipClass.CONTAINS,
    targetType: KeyVaultEntities.KEY_VAULT_KEY._type,
  },
  KEY_VAULT_CONTAINS_SECRET: {
    _type: KEY_VAULT_SECRET_RELATIONSHIP_TYPE,
    sourceType: KeyVaultEntities.KEY_VAULT._type,
    _class: RelationshipClass.CONTAINS,
    targetType: KeyVaultEntities.KEY_VAULT_SECRET._type,
  },
};
