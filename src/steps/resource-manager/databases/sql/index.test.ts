import { Entity } from '@jupiterone/integration-sdk-core';
import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../../test/createMockAzureStepExecutionContext';
import { IntegrationConfig } from '../../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../../active-directory';
import { fetchSQLDatabases, fetchSQLServerFirewallRules } from '.';
import { entities, relationships } from './constants';
import { MonitorEntities, MonitorRelationships } from '../../monitor/constants';
import { configFromEnv } from '../../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../../test/helpers/getMockAccountEntity';

let recording: Recording;
let instanceConfig: IntegrationConfig;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('step = SQL servers and databases', () => {
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
      name: 'resource-manager-step-sql-servers-and-databases',
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

    await fetchSQLDatabases(context);
  }, 120000);

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure SQL Server entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver`,
        _class: entities.SERVER._class,
        _type: entities.SERVER._type,
        administratorLogin: '****REDACTED****',
        administratorLoginPassword: '****REDACTED****',
        alertAdmins: false,
        alertEmails: [],
        alertOnAllThreats: false,
        alertingEnabled: false,
        alertsDisabled: [],
        auditActionsAndGroups: [],
        auditLogAccessKey: undefined,
        auditLogDestination: '',
        auditLogMonitorEnabled: true,
        auditLogRetentionDays: 0,
        auditingEnabled: false,
        classification: null,
        displayName: 'j1dev-sqlserver',
        encrypted: null,
        fqdn: 'j1dev-sqlserver.database.windows.net',
        fullyQualifiedDomainName: 'j1dev-sqlserver.database.windows.net',
        hostname: 'j1dev-sqlserver.database.windows.net',
        kind: 'v12.0',
        location: 'eastus',
        loggingEnabled: false,
        name: 'j1dev-sqlserver',
        resourceGroup: 'j1dev',
        state: 'Ready',
        'tag.environment': 'j1dev',
        type: 'Microsoft.Sql/servers',
        version: '12.0',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver`,
      }),
    );
  });

  it('should collect Azure Resource Group has Azure SQL Server relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type: relationships.RESOURCE_GROUP_HAS_SQL_SERVER._type,
      _class: relationships.RESOURCE_GROUP_HAS_SQL_SERVER._class,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver`,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver`,
      displayName: relationships.RESOURCE_GROUP_HAS_SQL_SERVER._class,
    });
  });

  it('should collect an Azure SQL Server Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/databases/j1dev-sqldatabase`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/databases/j1dev-sqldatabase`,
        _class: entities.DATABASE._class,
        _type: entities.DATABASE._type,
        active: true,
        auditLogAccessKey: undefined,
        auditLogDestination: '',
        auditLogMonitorEnabled: true,
        auditLogRetentionDays: 0,
        auditingEnabled: false,
        catalogCollation: 'SQL_Latin1_General_CP1_CI_AS',
        classification: null,
        collation: 'SQL_Latin1_General_CP1_CI_AS',
        currentServiceObjectiveName: 'Free',
        databaseId: expect.any(String),
        defaultSecondaryLocation: 'westus',
        displayName: 'j1dev-sqldatabase',
        encrypted: true,
        kind: 'v12.0,user',
        location: 'eastus',
        maxSizeBytes: 33554432,
        name: 'j1dev-sqldatabase',
        readReplicaCount: 0,
        readScale: 'Disabled',
        requestedServiceObjectiveName: 'Free',
        resourceGroup: 'j1dev',
        status: 'Online',
        'tag.environment': 'j1dev',
        type: 'Microsoft.Sql/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/databases/j1dev-sqldatabase`,
        zoneRedundant: false,
      }),
    );
  });

  it('should collect Azure SQL Server has Azure SQL Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type: relationships.SQL_SERVER_HAS_SQL_DATABASE._type,
      _class: relationships.SQL_SERVER_HAS_SQL_DATABASE._class,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/databases/j1dev-sqldatabase`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/databases/j1dev-sqldatabase`,
      displayName: relationships.SQL_SERVER_HAS_SQL_DATABASE._class,
    });
  });

  it('should collect an Azure SQL Server Database entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/databases/master`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/databases/master`,
        _class: entities.DATABASE._class,
        _type: entities.DATABASE._type,
        active: true,
        auditLogAccessKey: undefined,
        auditLogDestination: '',
        auditLogMonitorEnabled: false,
        auditLogRetentionDays: 0,
        auditingEnabled: false,
        catalogCollation: 'SQL_Latin1_General_CP1_CI_AS',
        classification: null,
        collation: 'SQL_Latin1_General_CP1_CI_AS',
        currentServiceObjectiveName: 'System0',
        databaseId: expect.any(String),
        defaultSecondaryLocation: 'westus',
        displayName: 'master',
        encrypted: false,
        kind: 'v12.0,system',
        location: 'eastus',
        managedBy: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver`,
        maxSizeBytes: 32212254720,
        name: 'master',
        readReplicaCount: 0,
        readScale: 'Disabled',
        requestedServiceObjectiveName: 'System0',
        resourceGroup: 'j1dev',
        status: 'Online',
        type: 'Microsoft.Sql/servers/databases',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/databases/master`,
        zoneRedundant: false,
      }),
    );
  });

  it('should collect Azure SQL Server has Azure SQL Database relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type: relationships.SQL_SERVER_HAS_SQL_DATABASE._type,
      _class: relationships.SQL_SERVER_HAS_SQL_DATABASE._class,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/databases/master`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver/databases/master`,
      displayName: relationships.SQL_SERVER_HAS_SQL_DATABASE._class,
    });
  });

  it('should collect Azure Diagnostic Metric Setting entities', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.sql/servers/j1dev-sqlserver/providers/microsoft.insights/diagnosticSettings/j1dev_sql_diag_set/metrics/AllMetrics/true/undefined/1/true`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.sql/servers/j1dev-sqlserver/providers/microsoft.insights/diagnosticSettings/j1dev_sql_diag_set/metrics/AllMetrics/true/undefined/1/true`,
        _class: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._class,
        _type: MonitorEntities.DIAGNOSTIC_METRIC_SETTING._type,
        category: 'AllMetrics',
        displayName: 'j1dev_sql_diag_set',
        enabled: true,
        eventHubAuthorizationRuleId: null,
        eventHubName: null,
        logAnalyticsDestinationType: null,
        name: 'j1dev_sql_diag_set',
        'retentionPolicy.days': 1,
        'retentionPolicy.enabled': true,
        serviceBusRuleId: null,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        timeGrain: undefined,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.sql/servers/j1dev-sqlserver/providers/microsoft.insights/diagnosticSettings/j1dev_sql_diag_set`,
        workspaceId: null,
      }),
    );
  });

  it('should collect Azure SQL Server has Azure Diagnostic Metric Setting relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type:
        MonitorRelationships
          .AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_METRIC_SETTING._type,
      _class:
        MonitorRelationships
          .AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_METRIC_SETTING._class,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Sql/servers/j1dev-sqlserver|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.sql/servers/j1dev-sqlserver/providers/microsoft.insights/diagnosticSettings/j1dev_sql_diag_set/metrics/AllMetrics/true/undefined/1/true`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.sql/servers/j1dev-sqlserver/providers/microsoft.insights/diagnosticSettings/j1dev_sql_diag_set/metrics/AllMetrics/true/undefined/1/true`,
      displayName:
        MonitorRelationships
          .AZURE_RESOURCE_HAS_MONITOR_DIAGNOSTIC_METRIC_SETTING._class,
    });
  });

  it('should Azure Diagnostic Metric Setting uses Azure Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _type:
        MonitorRelationships.DIAGNOSTIC_METRIC_SETTING_USES_STORAGE_ACCOUNT
          ._type,
      _class:
        MonitorRelationships.DIAGNOSTIC_METRIC_SETTING_USES_STORAGE_ACCOUNT
          ._class,
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.sql/servers/j1dev-sqlserver/providers/microsoft.insights/diagnosticSettings/j1dev_sql_diag_set/metrics/AllMetrics/true/undefined/1/true`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/microsoft.sql/servers/j1dev-sqlserver/providers/microsoft.insights/diagnosticSettings/j1dev_sql_diag_set/metrics/AllMetrics/true/undefined/1/true|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      displayName:
        MonitorRelationships.DIAGNOSTIC_METRIC_SETTING_USES_STORAGE_ACCOUNT
          ._class,
    });
  });
});

describe('rm-database-sql-server-firewall-rules', () => {
  async function getSetupEntities() {
    const accountEntity = getMockAccountEntity(configFromEnv);

    const setupContext = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchSQLDatabases(setupContext);
    const j1devSqlServerEntities = setupContext.jobState.collectedEntities.filter(
      (e) =>
        e._type === entities.SERVER._type &&
        e.displayName === 'j1dev-sqlserver',
    );
    expect(j1devSqlServerEntities.length).toBe(1);
    const sqlServerEntity = j1devSqlServerEntities[0];

    return { accountEntity, sqlServerEntity };
  }

  test('step', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-database-sql-server-firewall-rules',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { sqlServerEntity, accountEntity } = await getSetupEntities();

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [sqlServerEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchSQLServerFirewallRules(context);

    const sqlServerFirewallRuleEntities = context.jobState.collectedEntities;

    expect(sqlServerFirewallRuleEntities.length).toBeGreaterThan(0);
    expect(sqlServerFirewallRuleEntities).toMatchGraphObjectSchema({
      _class: entities.FIREWALL_RULE._class,
    });

    const sqlServerFirewallRuleRelationships =
      context.jobState.collectedRelationships;

    expect(sqlServerFirewallRuleRelationships.length).toBe(
      sqlServerFirewallRuleEntities.length,
    );
    expect(sqlServerFirewallRuleRelationships).toMatchDirectRelationshipSchema(
      {},
    );
  });
});
