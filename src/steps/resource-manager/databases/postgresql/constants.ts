import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../../utils/createResourceGroupResourceRelationship';
import {
  RM_DATABASE_ENTITY_CLASS,
  RM_DATABASE_SERVER_ENTITY_CLASS,
} from '../constants';

export const steps = {
  SERVERS: 'rm-database-postgresql-servers',
  DATABASES: 'rm-database-postgresql-databases',
  SERVER_FIREWALL_RULES: 'rm-database-postgresql-server-firewall-rules',
};

export const PostgreSQLEntities = {
  SERVER: {
    _type: 'azure_postgresql_server',
    _class: RM_DATABASE_SERVER_ENTITY_CLASS,
    resourceName: '[RM] PostgreSQL Server',
  },
  DATABASE: {
    _type: 'azure_postgresql_database',
    _class: RM_DATABASE_ENTITY_CLASS,
    resourceName: '[RM] PostgreSQL Database',
  },
  FIREWALL_RULE: {
    _type: 'azure_postgresql_server_firewall_rule',
    _class: ['Firewall'],
    resourceName: '[RM] PostgreSQL Server Firewall Rule',
  },
};

export const PostgreSQLRelationships = {
  RESOURCE_GROUP_HAS_POSTGRESQL_SERVER: createResourceGroupResourceRelationshipMetadata(
    PostgreSQLEntities.SERVER._type,
  ),
  POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      PostgreSQLEntities.SERVER._type,
      PostgreSQLEntities.DATABASE._type,
    ),
    sourceType: PostgreSQLEntities.SERVER._type,
    _class: RelationshipClass.HAS,
    targetType: PostgreSQLEntities.DATABASE._type,
  },
  POSTGRESQL_SERVER_HAS_FIREWALL_RULE: {
    _type: 'azure_postgresql_server_has_firewall_rule',
    sourceType: PostgreSQLEntities.SERVER._type,
    _class: RelationshipClass.HAS,
    targetType: PostgreSQLEntities.FIREWALL_RULE._type,
  },
};
