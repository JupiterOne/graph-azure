import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createResourceGroupResourceRelationshipMetadata } from '../../utils/createResourceGroupResourceRelationship';
import {
  RM_DATABASE_ENTITY_CLASS,
  RM_DATABASE_SERVER_ENTITY_CLASS,
} from '../constants';

export const MariaDBEntities = {
  SERVER: {
    _type: 'azure_mariadb_server',
    _class: RM_DATABASE_SERVER_ENTITY_CLASS,
    resourceName: '[RM] MariaDB Server',
  },

  DATABASE: {
    _type: 'azure_mariadb_database',
    _class: RM_DATABASE_ENTITY_CLASS,
    resourceName: '[RM] MariaDB Database',
  },
};

export const MariaDBRelationships = {
  RESOURCE_GROUP_HAS_MARIADB_SERVER: createResourceGroupResourceRelationshipMetadata(
    MariaDBEntities.SERVER._type,
  ),

  MARIADB_SERVER_HAS_MARIADB_DATABASE: {
    _type: generateRelationshipType(
      RelationshipClass.HAS,
      MariaDBEntities.SERVER._type,
      MariaDBEntities.DATABASE._type,
    ),
    sourceType: MariaDBEntities.SERVER._type,
    _class: RelationshipClass.HAS,
    targetType: MariaDBEntities.DATABASE._type,
  },
};
