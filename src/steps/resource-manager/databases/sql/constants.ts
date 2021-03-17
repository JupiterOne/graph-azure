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
};
