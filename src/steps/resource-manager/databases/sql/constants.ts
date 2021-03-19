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
  DATABASES: 'rm-database-sql-databases',
  SERVER_FIREWALL_RULES: 'rm-database-sql-server-firewall-rules',
};

export const entities = {
  SERVER: {
    _type: 'azure_sql_server',
    _class: RM_DATABASE_SERVER_ENTITY_CLASS,
    resourceName: '[RM] SQL Server',
  },
  DATABASE: {
    _type: 'azure_sql_database',
    _class: RM_DATABASE_ENTITY_CLASS,
    resourceName: '[RM] SQL Database',
  },
  FIREWALL_RULE: {
    _type: 'azure_sql_server_firewall_rule',
    _class: ['Firewall'],
    resourceName: '[RM] SQL Server Firewall Rule',
  },
};

export const relationships = {
  RESOURCE_GROUP_HAS_SQL_SERVER: createResourceGroupResourceRelationshipMetadata(
    entities.SERVER._type,
  ),
  SQL_SERVER_HAS_SQL_DATABASE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      entities.SERVER._type,
      entities.DATABASE._type,
    ),
    sourceType: entities.SERVER._type,
    _class: RelationshipClass.HAS,
    targetType: entities.DATABASE._type,
  },
  SQL_SERVER_HAS_FIREWALL_RULE: {
    _type: 'azure_sql_server_has_firewall_rule',
    sourceType: entities.SERVER._type,
    _class: RelationshipClass.HAS,
    targetType: entities.FIREWALL_RULE._type,
  },
};
