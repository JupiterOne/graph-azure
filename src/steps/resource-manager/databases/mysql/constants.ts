import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../../utils/createResourceGroupResourceRelationship';
import {
  RM_DATABASE_ENTITY_CLASS,
  RM_DATABASE_SERVER_ENTITY_CLASS,
} from '../constants';

export const MySQLEntities = {
  SERVER: {
    _type: 'azure_mysql_server',
    _class: RM_DATABASE_SERVER_ENTITY_CLASS,
    resourceName: '[RM] MySQL Server',
  },

  DATABASE: {
    _type: 'azure_mysql_database',
    _class: RM_DATABASE_ENTITY_CLASS,
    resourceName: '[RM] MySQL Database',
  },
};

export const MySQLRelationships = {
  RESOURCE_GROUP_HAS_MYSQL_SERVER: createResourceGroupResourceRelationshipMetadata(
    MySQLEntities.SERVER._type,
  ),

  MYSQL_SERVER_HAS_MYSQL_DATABASE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      MySQLEntities.SERVER._type,
      MySQLEntities.DATABASE._type,
    ),
    sourceType: MySQLEntities.SERVER._type,
    _class: RelationshipClass.HAS,
    targetType: MySQLEntities.DATABASE._type,
  },
};
