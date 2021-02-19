import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../../utils/createResourceGroupResourceRelationship';
import {
  RM_DATABASE_ENTITY_CLASS,
  RM_DATABASE_SERVER_ENTITY_CLASS,
} from '../constants';

export const SQLEntities = {
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

export const SQLRelationships = {
  RESOURCE_GROUP_HAS_SQL_SERVER: createResourceGroupResourceRelationshipMetadata(
    SQLEntities.SERVER._type,
  ),

  SQL_SERVER_HAS_SQL_DATABASE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      SQLEntities.SERVER._type,
      SQLEntities.DATABASE._type,
    ),
    sourceType: SQLEntities.SERVER._type,
    _class: RelationshipClass.HAS,
    targetType: SQLEntities.DATABASE._type,
  },
};
