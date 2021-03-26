import { Entity } from '@jupiterone/integration-sdk-core';
import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupAzureRecording } from '../../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../../test/createMockAzureStepExecutionContext';
import { IntegrationConfig } from '../../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../../active-directory';
import { fetchMariaDBDatabases } from '.';
import { MariaDBEntities, MariaDBRelationships } from './constants';

let recording: Recording;
let instanceConfig: IntegrationConfig;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

describe('step = MariaDB servers and databases', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-mariadb-servers-and-databases',
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

    await fetchMariaDBDatabases(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect Azure MariaDB Server entities', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
        _class: MariaDBEntities.SERVER._class,
        _type: MariaDBEntities.SERVER._type,
        administratorLogin: '****REDACTED****',
        administratorLoginPassword: '****REDACTED****',
        backupRetentionDays: 7,
        classification: null,
        displayName: 'j1dev-mariadb-server',
        encrypted: null,
        fqdn: 'j1dev-mariadb-server.mariadb.database.azure.com',
        fullyQualifiedDomainName:
          'j1dev-mariadb-server.mariadb.database.azure.com',
        geoRedundantBackup: 'Disabled',
        hostname: 'j1dev-mariadb-server.mariadb.database.azure.com',
        location: 'eastus',
        masterServerId: '',
        name: 'j1dev-mariadb-server',
        replicationRole: '',
        resourceGroup: 'j1dev',
        'sku.capacity': 2,
        'sku.family': 'Gen5',
        'sku.name': 'B_Gen5_2',
        'sku.tier': 'Basic',
        sslEnforcement: 'Enabled',
        storageAutogrow: 'Disabled',
        storageMb: 51200,
        type: 'Microsoft.DBforMariaDB/servers',
        userVisibleState: 'Ready',
        version: '10.2',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
      }),
    );
  });

  it('should collect Azure Resource Group has Azure MariaDB Server relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type: MariaDBRelationships.RESOURCE_GROUP_HAS_MARIADB_SERVER._type,
      _class: MariaDBRelationships.RESOURCE_GROUP_HAS_MARIADB_SERVER._class,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
      displayName:
        MariaDBRelationships.RESOURCE_GROUP_HAS_MARIADB_SERVER._class,
    });
  });

  it('should collect an Azure MariaDB Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/information_schema`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/information_schema`,
        _class: MariaDBEntities.DATABASE._class,
        _type: MariaDBEntities.DATABASE._type,
        charset: 'utf8',
        classification: null,
        collation: 'utf8_general_ci',
        createdOn: undefined,
        displayName: 'information_schema',
        encrypted: null,
        name: 'information_schema',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforMariaDB/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/information_schema`,
      }),
    );
  });

  it('should collect an Azure MariaDB Server has Azure MariaDB Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._class,
      _type: MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._type,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/information_schema`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/information_schema`,
      displayName:
        MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._class,
    });
  });

  it('should collect an Azure MariaDB Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/j1dev_mariadb_database`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/j1dev_mariadb_database`,
        _class: MariaDBEntities.DATABASE._class,
        _type: MariaDBEntities.DATABASE._type,
        charset: 'utf8',
        classification: null,
        collation: 'utf8_general_ci',
        createdOn: undefined,
        displayName: 'j1dev_mariadb_database',
        encrypted: null,
        name: 'j1dev_mariadb_database',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforMariaDB/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/j1dev_mariadb_database`,
      }),
    );
  });

  it('should collect an Azure MariaDB Server has Azure MariaDB Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._class,
      _type: MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._type,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/j1dev_mariadb_database`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/j1dev_mariadb_database`,
      displayName:
        MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._class,
    });
  });

  it('should collect an Azure MariaDB Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/mysql`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/mysql`,
        _class: MariaDBEntities.DATABASE._class,
        _type: MariaDBEntities.DATABASE._type,
        charset: 'latin1',
        classification: null,
        collation: 'latin1_swedish_ci',
        createdOn: undefined,
        displayName: 'mysql',
        encrypted: null,
        name: 'mysql',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforMariaDB/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/mysql`,
      }),
    );
  });

  it('should collect an Azure MariaDB Server has Azure MariaDB Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._class,
      _type: MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._type,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/mysql`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/mysql`,
      displayName:
        MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._class,
    });
  });

  it('should collect an Azure MariaDB Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/performance_schema`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/performance_schema`,
        _class: MariaDBEntities.DATABASE._class,
        _type: MariaDBEntities.DATABASE._type,
        charset: 'utf8',
        classification: null,
        collation: 'utf8_general_ci',
        createdOn: undefined,
        displayName: 'performance_schema',
        encrypted: null,
        name: 'performance_schema',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforMariaDB/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/performance_schema`,
      }),
    );
  });

  it('should collect an Azure MariaDB Server has Azure MariaDB Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._class,
      _type: MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._type,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/performance_schema`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMariaDB/servers/j1dev-mariadb-server/databases/performance_schema`,
      displayName:
        MariaDBRelationships.MARIADB_SERVER_HAS_MARIADB_DATABASE._class,
    });
  });
});
