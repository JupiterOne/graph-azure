import {
  RelationshipClass,
  generateRelationshipType,
} from '@jupiterone/integration-sdk-core';
import { entities } from '../subscriptions/constants';
import { KEY_VAULT_SERVICE_ENTITY_TYPE } from '../key-vault/constants';

export const SYNAPSE_STEPS = {
  SYNAPSE_SERVICE: 'fetch-synapse-service',
  SYNAPSE_WORKSPACES: 'fetch-synpase-workspaces',
  SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP:
    'build-synapse-service-workspace-relationship',
  SYNAPSE_SQL_POOL: 'fetch-synapse-sql-pools',
  SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP:
    'build-synapse-service-sql-pool-relationship',
  SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP:
    'build-workspace-sql-pool-relationship',
  SYNAPSE_KEYS: 'fetch-synapse-keys',
  SYNAPSE_SERVICE_KEY_RELATIONSHIP: 'build-synapse-service-key-relationship',
  SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP:
    'build-synapse-workspace-keys-relationship',
  SYNAPSE_DATA_MASKING_POLICY: 'fetch-synapse-data-masking-policy',
  SYNAPSE_DATA_MASKING_RULE: 'fetch-synapse-data-masking-rule',
  SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP:
    'build-sql-pool-data-masking-policy-relationship',
  KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP:
    'build-vault-service-synapse-key-relationship',
};

export const SynapseEntities = {
  WORKSPACE: {
    _type: 'azure_synapse_workspace',
    _class: ['Configuration'],
    resourceName: '[RM] Workspaces',
  },
  SYNAPSE_KEYS: {
    _type: 'azure_synapse_key',
    _class: 'Key',
    resourceName: '[RM] Synapse Keys',
  },
  SYNAPSE_SERVICE: {
    _type: 'azure_synapse',
    _class: 'Service',
    resourceName: 'Azure Synapse Analytics',
  },
  SYNAPSE_SQL_POOL: {
    _type: 'azure_synapse_sql_pool',
    _class: 'Configuration',
    resourceName: '[RM] SQL Pool',
  },
  SYNAPSE_DATA_MASKING_POLICY: {
    _type: 'azure_synapse_masking_policy',
    _class: 'Policy',
    resourceName: '[RM] Data Masking Policy',
  },
  SYNAPSE_DATA_MASKING_RULE: {
    _type: 'azure_synapse_masking_rule',
    _class: 'Rule',
    resourceName: '[RM] Data Masking Rule',
  },
};

export const SynapseRelationship = {
  SUBSCRIPTION_HAS_SYNAPSE_SERVICE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      entities.SUBSCRIPTION,
      SynapseEntities.SYNAPSE_SERVICE,
    ),
    sourceType: entities.SUBSCRIPTION._type,
    _class: RelationshipClass.HAS,
    targetType: SynapseEntities.SYNAPSE_SERVICE._type,
  },
  SYNAPSE_SERVICE_HAS_WORKSPACE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      SynapseEntities.SYNAPSE_SERVICE,
      SynapseEntities.WORKSPACE,
    ),
    sourceType: SynapseEntities.SYNAPSE_SERVICE._type,
    _class: RelationshipClass.HAS,
    targetType: SynapseEntities.WORKSPACE._type,
  },
  SYNAPSE_SERVICE_KEYS: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      SynapseEntities.SYNAPSE_SERVICE,
      SynapseEntities.SYNAPSE_KEYS,
    ),
    sourceType: SynapseEntities.SYNAPSE_SERVICE._type,
    _class: RelationshipClass.HAS,
    targetType: SynapseEntities.SYNAPSE_KEYS._type,
  },
  SYNAPSE_SERVICE_HAS_SQL_POOL: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      SynapseEntities.SYNAPSE_SERVICE,
      SynapseEntities.SYNAPSE_SQL_POOL,
    ),
    sourceType: SynapseEntities.SYNAPSE_SERVICE._type,
    _class: RelationshipClass.HAS,
    targetType: SynapseEntities.SYNAPSE_SQL_POOL._type,
  },
  SYNAPSE_WORKSPACE_HAS_SQL_POOL: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      SynapseEntities.WORKSPACE,
      SynapseEntities.SYNAPSE_SQL_POOL,
    ),
    sourceType: SynapseEntities.WORKSPACE._type,
    _class: RelationshipClass.HAS,
    targetType: SynapseEntities.SYNAPSE_SQL_POOL._type,
  },
  SYNAPSE_SQL_POOL_ASSIGNED_DATA_MASKING_POLICY: {
    _type: generateRelationshipType(
      RelationshipClass.ASSIGNED,
      SynapseEntities.SYNAPSE_SQL_POOL,
      SynapseEntities.SYNAPSE_DATA_MASKING_POLICY,
    ),
    sourceType: SynapseEntities.SYNAPSE_SQL_POOL._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: SynapseEntities.SYNAPSE_DATA_MASKING_POLICY._type,
  },
  SYNAPSE_WORKSPACE_HAS_KEYS: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      SynapseEntities.WORKSPACE,
      SynapseEntities.SYNAPSE_KEYS,
    ),
    sourceType: SynapseEntities.WORKSPACE._type,
    _class: RelationshipClass.HAS,
    targetType: SynapseEntities.SYNAPSE_KEYS._type,
  },
  VALUT_SERVICE_HAS_SYNAPSE_KEY: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      KEY_VAULT_SERVICE_ENTITY_TYPE,
      SynapseEntities.SYNAPSE_KEYS,
    ),
    sourceType: KEY_VAULT_SERVICE_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: SynapseEntities.SYNAPSE_KEYS._type,
  },
};
