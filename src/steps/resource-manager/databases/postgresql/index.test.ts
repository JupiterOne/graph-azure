import { Entity } from '@jupiterone/integration-sdk-core';
import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupAzureRecording } from '../../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../../test/createMockAzureStepExecutionContext';
import { IntegrationConfig } from '../../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../../active-directory';
import { fetchPostgreSQLDatabases } from '.';
import { PostgreSQLEntities, PostgreSQLRelationships } from './constants';

let recording: Recording;
let instanceConfig: IntegrationConfig;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

describe('step = postgreSQL servers and databases', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-postgresql-servers-and-databases',
    });

    const resourceGroupEntity: Entity = {
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _type: 'azure_resource_group',
      _class: ['Group'],
      name: 'j1dev',
      id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
    };

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [resourceGroupEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: {
          defaultDomain: 'www.fake-domain.com',
          _type: ACCOUNT_ENTITY_TYPE,
          _key: 'azure_account_id',
          id: 'azure_account_id',
        },
      },
    });

    await fetchPostgreSQLDatabases(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it.only('should collect Azure PostgreSQL Server entities', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver`,
        _type: PostgreSQLEntities.SERVER._type,
        _class: PostgreSQLEntities.SERVER._class,
        administratorLogin: '****REDACTED****',
        administratorLoginPassword: '****REDACTED****',
        backupRetentionDays: 7,
        classification: null,
        createdOn: undefined,
        displayName: 'j1dev-psqlserver',
        encrypted: null,
        fqdn: 'j1dev-psqlserver.postgres.database.azure.com',
        fullyQualifiedDomainName:
          'j1dev-psqlserver.postgres.database.azure.com',
        geoRedundantBackup: 'Disabled',
        hostname: 'j1dev-psqlserver.postgres.database.azure.com',
        location: 'eastus',
        masterServerId: '',
        name: 'j1dev-psqlserver',
        replicationRole: '',
        resourceGroup: 'j1dev',
        'sku.capacity': 4,
        'sku.family': 'Gen5',
        'sku.name': 'GP_Gen5_4',
        'sku.tier': 'GeneralPurpose',
        sslEnforcement: 'Enabled',
        storageAutogrow: 'Disabled',
        storageMb: 640000,
        type: 'Microsoft.DBforPostgreSQL/servers',
        userVisibleState: 'Ready',
        version: '9.6',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver`,
      }),
    );
  });

  it('should collect Azure Resource Group has Azure PostgreSQL Server relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type: PostgreSQLRelationships.RESOURCE_GROUP_HAS_POSTGRESQL_SERVER._type,
      _class:
        PostgreSQLRelationships.RESOURCE_GROUP_HAS_POSTGRESQL_SERVER._class,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver`,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver`,
      displayName:
        PostgreSQLRelationships.RESOURCE_GROUP_HAS_POSTGRESQL_SERVER._class,
    });
  });

  it('should collect Azure PostgreSQL Database entities', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/postgres`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/postgres`,
        _type: PostgreSQLEntities.DATABASE._type,
        _class: PostgreSQLEntities.DATABASE._class,
        charset: 'UTF8',
        classification: null,
        collation: 'English_United States.1252',
        createdOn: undefined,
        displayName: 'postgres',
        encrypted: null,
        name: 'postgres',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforPostgreSQL/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/postgres`,
      }),
    );
  });

  it('should collect Azure PostgreSQL Database entities', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_maintenance`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_maintenance`,
        _type: PostgreSQLEntities.DATABASE._type,
        _class: PostgreSQLEntities.DATABASE._class,
        charset: 'UTF8',
        classification: null,
        collation: 'English_United States.1252',
        createdOn: undefined,
        displayName: 'azure_maintenance',
        encrypted: null,
        name: 'azure_maintenance',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforPostgreSQL/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_maintenance`,
      }),
    );
  });

  it('should collect Azure PostgreSQL Database entities', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_sys`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_sys`,
        _type: PostgreSQLEntities.DATABASE._type,
        _class: PostgreSQLEntities.DATABASE._class,
        charset: 'UTF8',
        classification: null,
        collation: 'English_United States.1252',
        createdOn: undefined,
        displayName: 'azure_sys',
        encrypted: null,
        name: 'azure_sys',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforPostgreSQL/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_sys`,
      }),
    );
  });

  it('should collect Azure PostgreSQL Server has Azure PostgreSQL Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type:
        PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE._type,
      _class:
        PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE
          ._class,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/postgres`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/postgres`,
      displayName:
        PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE
          ._class,
    });
  });

  it('should collect Azure PostgreSQL Server has Azure PostgreSQL Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type:
        PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE._type,
      _class:
        PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE
          ._class,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_maintenance`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_maintenance`,
      displayName:
        PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE
          ._class,
    });
  });

  it('should collect Azure PostgreSQL Server has Azure PostgreSQL Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type:
        PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE._type,
      _class:
        PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE
          ._class,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_sys`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforPostgreSQL/servers/j1dev-psqlserver/databases/azure_sys`,
      displayName:
        PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE
          ._class,
    });
  });
});
