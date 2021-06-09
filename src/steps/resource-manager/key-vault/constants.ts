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

// Graph objects
export const KEY_VAULT_SERVICE_ENTITY_TYPE = 'azure_keyvault_service';
export const KEY_VAULT_SERVICE_ENTITY_CLASS = ['Service'];

export const KeyVaultEntities = {
  KEY_VAULT: {
    _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
    _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
    resourceName: '[RM] Key Vault',
    diagnosticLogCategories: ['AuditEvent'],
  },
};

export const ACCOUNT_KEY_VAULT_RELATIONSHIP_CLASS = RelationshipClass.HAS;
export const ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE = generateRelationshipType(
  ACCOUNT_KEY_VAULT_RELATIONSHIP_CLASS,
  ACCOUNT_ENTITY_TYPE,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
);

export const KeyVaultRelationships = {
  KEY_VAULT_ALLOWS_PRINCIPAL: {
    _type: 'azure_keyvault_service_allows_principal',
    sourceType: KeyVaultEntities.KEY_VAULT._type,
    _class: RelationshipClass.ALLOWS,
    targetType: ANY_PRINCIPAL,
  },
};
