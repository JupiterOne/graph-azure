import {
  RelationshipClass,
  generateRelationshipType,
} from '@jupiterone/integration-sdk-core';

export const SYNAPSE_STEPS = {
  SYNAPSE_SERVICE: 'fetch-synapse-service',
  SYNAPSE_WORKSPACES: 'fetch-synpase-workspaces',
  SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP:
    'build-synapse-service-workspace-relationship',
  SYNAPSE_SQL_POOL: 'fetch-synapse-sql-pools',
};

export const SynapseEntities = {
  WORKSPACE: {
    _type: 'azure_synapse_workspace',
    _class: ['Configuration'],
    resourceName: '[RM] Workspaces',
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
};

export const SynapseRelationship = {
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
};
