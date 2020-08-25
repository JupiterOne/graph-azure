import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';

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
