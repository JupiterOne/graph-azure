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
  SERVERS: 'rm-database-sql-servers',
  SERVER_DIAGNOSTIC_SETTINGS: 'rm-sql-server-diagnostic-settings',
  DATABASES: 'rm-database-sql-databases',
  SERVER_FIREWALL_RULES: 'rm-database-sql-server-firewall-rules',
  SERVER_AD_ADMINS: 'rm-database-sql-server-active-directory-admins',
};

export const entities = {
  SERVER: {
    _type: 'azure_sql_server',
    _class: RM_DATABASE_SERVER_ENTITY_CLASS,
    resourceName: '[RM] SQL Server',
    rawDataKeys: {
      ENCRYPTION_PROTECTOR: 'encryptionProtector',
    },
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
  ACTIVE_DIRECTORY_ADMIN: {
    _type: 'azure_sql_server_active_directory_admin',
    _class: ['AccessRole'],
    resourceName: '[RM] SQL Server Active Directory Admin',
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
  SQL_SERVER_HAS_AD_ADMIN: {
    _type: 'azure_sql_server_has_active_directory_admin',
    sourceType: entities.SERVER._type,
    _class: RelationshipClass.HAS,
    targetType: entities.ACTIVE_DIRECTORY_ADMIN._type,
  },
};
