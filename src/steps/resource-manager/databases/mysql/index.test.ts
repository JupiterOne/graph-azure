import { Entity } from '@jupiterone/integration-sdk-core';
import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupAzureRecording } from '../../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../../test/createMockAzureStepExecutionContext';
import { IntegrationConfig } from '../../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../../active-directory';
import { fetchMySQLDatabases } from '.';
import { MySQLEntities, MySQLRelationships } from './constants';

let recording: Recording;
let instanceConfig: IntegrationConfig;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

describe('step = MySQL servers and databases', () => {
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
      name: 'resource-manager-step-mysql-servers-and-databases',
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

    await fetchMySQLDatabases(context);
  }, 120000);

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure MySQL Server entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver`,
        _class: MySQLEntities.SERVER._class,
        _type: MySQLEntities.SERVER._type,
        administratorLogin: '****REDACTED****',
        administratorLoginPassword: '****REDACTED****',
        backupRetentionDays: 7,
        classification: null,
        createdOn: undefined,
        displayName: 'j1dev-mysqlserver',
        encrypted: null,
        fqdn: 'j1dev-mysqlserver.mysql.database.azure.com',
        fullyQualifiedDomainName: 'j1dev-mysqlserver.mysql.database.azure.com',
        geoRedundantBackup: 'Disabled',
        hostname: 'j1dev-mysqlserver.mysql.database.azure.com',
        location: 'eastus',
        masterServerId: '',
        name: 'j1dev-mysqlserver',
        replicationRole: '',
        resourceGroup: 'j1dev',
        'sku.capacity': 2,
        'sku.family': 'Gen5',
        'sku.name': 'B_Gen5_2',
        'sku.tier': 'Basic',
        sslEnforcement: 'Disabled',
        storageAutogrow: 'Disabled',
        storageMb: 5120,
        'tag.environment': 'j1dev',
        type: 'Microsoft.DBforMySQL/servers',
        userVisibleState: 'Ready',
        version: '5.7',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver`,
      }),
    );
  });

  it('should collect Azure Resource Group has Azure MySQL Server relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type: MySQLRelationships.RESOURCE_GROUP_HAS_MYSQL_SERVER._type,
      _class: MySQLRelationships.RESOURCE_GROUP_HAS_MYSQL_SERVER._class,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver`,
      displayName: MySQLRelationships.RESOURCE_GROUP_HAS_MYSQL_SERVER._class,
    });
  });

  it('should collect an Azure MySQL Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/information_schema`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/information_schema`,
        _class: MySQLEntities.DATABASE._class,
        _type: MySQLEntities.DATABASE._type,
        charset: 'utf8',
        classification: null,
        collation: 'utf8_general_ci',
        displayName: 'information_schema',
        encrypted: null,
        name: 'information_schema',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforMySQL/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/information_schema`,
      }),
    );
  });

  it('should collect an Azure MySQL Server has Azure MySQL Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._class,
      _type: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._type,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/information_schema`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/information_schema`,
      displayName: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._class,
    });
  });

  it('should collect an Azure MySQL Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/j1dev-mysqldb`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/j1dev-mysqldb`,
        _class: MySQLEntities.DATABASE._class,
        _type: MySQLEntities.DATABASE._type,
        charset: 'utf8',
        classification: null,
        collation: 'utf8_unicode_ci',
        displayName: 'j1dev-mysqldb',
        encrypted: null,
        name: 'j1dev-mysqldb',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforMySQL/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/j1dev-mysqldb`,
      }),
    );
  });

  it('should collect an Azure MySQL Server has Azure MySQL Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._class,
      _type: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._type,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/j1dev-mysqldb`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/j1dev-mysqldb`,
      displayName: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._class,
    });
  });

  it('should collect an Azure MySQL Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/mysql`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/mysql`,
        _class: MySQLEntities.DATABASE._class,
        _type: MySQLEntities.DATABASE._type,
        charset: 'latin1',
        classification: null,
        collation: 'latin1_swedish_ci',
        displayName: 'mysql',
        encrypted: null,
        name: 'mysql',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforMySQL/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/mysql`,
      }),
    );
  });

  it('should collect an Azure MySQL Server has Azure MySQL Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._class,
      _type: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._type,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/mysql`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/mysql`,
      displayName: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._class,
    });
  });

  it('should collect an Azure MySQL Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/performance_schema`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/performance_schema`,
        _class: MySQLEntities.DATABASE._class,
        _type: MySQLEntities.DATABASE._type,
        charset: 'utf8',
        classification: null,
        collation: 'utf8_general_ci',
        displayName: 'performance_schema',
        encrypted: null,
        name: 'performance_schema',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforMySQL/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/performance_schema`,
      }),
    );
  });

  it('should collect an Azure MySQL Server has Azure MySQL Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._class,
      _type: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._type,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/performance_schema`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/performance_schema`,
      displayName: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._class,
    });
  });

  it('should collect an Azure MySQL Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/sys`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/sys`,
        _class: MySQLEntities.DATABASE._class,
        _type: MySQLEntities.DATABASE._type,
        charset: 'utf8',
        classification: null,
        collation: 'utf8_general_ci',
        displayName: 'sys',
        encrypted: null,
        name: 'sys',
        resourceGroup: 'j1dev',
        type: 'Microsoft.DBforMySQL/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/sys`,
      }),
    );
  });

  it('should collect an Azure MySQL Server has Azure MySQL Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._class,
      _type: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._type,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/sys`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.DBforMySQL/servers/j1dev-mysqlserver/databases/sys`,
      displayName: MySQLRelationships.MYSQL_SERVER_HAS_MYSQL_DATABASE._class,
    });
  });
});
