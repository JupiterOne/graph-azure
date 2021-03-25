import { Entity, Relationship } from '@jupiterone/integration-sdk-core';
import { Recording } from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../../active-directory';
import {
  fetchSQLDatabases,
  fetchSQLServerActiveDirectoryAdmins,
  fetchSQLServerFirewallRules,
  fetchSQLServers,
} from '.';
import { entities, relationships } from './constants';
import { configFromEnv } from '../../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../../test/helpers/getMockAccountEntity';
import {
  filterGraphObjects,
  separateDiagnosticSettingsEntities,
  separateDiagnosticSettingsRelationships,
} from '../../../../../test/helpers/filterGraphObjects';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('rm-database-sql-servers', () => {
  function getSetupEntities() {
    const accountEntity = getMockAccountEntity(configFromEnv);

    return { accountEntity };
  }

  function separateEntities(collectedEntities: Entity[]) {
    const {
      targets: sqlServerEntities,
      rest: restAfterSqlServer,
    } = filterGraphObjects(
      collectedEntities,
      (e) => e._type === entities.SERVER._type,
    );
    const {
      diagnosticLogEntities,
      diagnosticMetricEntities,
      rest: restAfterDiagnosticSettings,
    } = separateDiagnosticSettingsEntities(restAfterSqlServer);

    return {
      sqlServerEntities,
      diagnosticLogEntities,
      diagnosticMetricEntities,
      rest: restAfterDiagnosticSettings,
    };
  }

  function separateRelationships(collectedRelationships: Relationship[]) {
    const {
      targets: resourceGroupServerRelationships,
      rest: restAfterResourceGroupServer,
    } = filterGraphObjects(
      collectedRelationships,
      (r) => r._type === relationships.RESOURCE_GROUP_HAS_SQL_SERVER._type,
    );
    const {
      diagnosticLogRelationships,
      diagnosticMetricRelationships,
      diagnosticLogStorageRelationships,
      diagnosticMetricStorageRelationships,
      rest: restAfterDiagnosticSettings,
    } = separateDiagnosticSettingsRelationships(restAfterResourceGroupServer);

    return {
      resourceGroupServerRelationships,
      diagnosticLogRelationships,
      diagnosticMetricRelationships,
      diagnosticLogStorageRelationships,
      diagnosticMetricStorageRelationships,
      rest: restAfterDiagnosticSettings,
    };
  }

  test('step', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-database-sql-servers',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity } = getSetupEntities();

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchSQLServers(context);

    const { sqlServerEntities, rest: restEntities } = separateEntities(
      context.jobState.collectedEntities,
    );

    expect(sqlServerEntities.length).toBeGreaterThan(0);
    expect(sqlServerEntities).toMatchGraphObjectSchema({
      _class: entities.SERVER._class,
    });

    expect(restEntities).toHaveLength(0);

    const { rest: restRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );

    expect(restRelationships).toHaveLength(0);
  });
});

describe('rm-database-sql-databases', () => {
  async function getSetupEntities() {
    const accountEntity = getMockAccountEntity(configFromEnv);

    const setupContext = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchSQLServers(setupContext);
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
      name: 'rm-database-sql-databases',
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

    await fetchSQLDatabases(context);

    const sqlDatabaseEntities = context.jobState.collectedEntities;

    expect(sqlDatabaseEntities.length).toBeGreaterThan(0);
    expect(sqlDatabaseEntities).toMatchGraphObjectSchema({
      _class: entities.DATABASE._class,
    });

    const sqlServerDatabaseRelationships =
      context.jobState.collectedRelationships;

    expect(sqlServerDatabaseRelationships.length).toBe(
      sqlDatabaseEntities.length,
    );
    expect(sqlServerDatabaseRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: relationships.SQL_SERVER_HAS_SQL_DATABASE._type },
        },
      },
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

    await fetchSQLServers(setupContext);
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

describe('rm-database-sql-server-active-directory-admins', () => {
  async function getSetupEntities() {
    const accountEntity = getMockAccountEntity(configFromEnv);

    const setupContext = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchSQLServers(setupContext);
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
      name: 'rm-database-sql-server-active-directory-admins',
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

    await fetchSQLServerActiveDirectoryAdmins(context);

    const sqlServerActiveDirectoryAdminEntities =
      context.jobState.collectedEntities;

    expect(sqlServerActiveDirectoryAdminEntities.length).toBeGreaterThan(0);
    expect(sqlServerActiveDirectoryAdminEntities).toMatchGraphObjectSchema({
      _class: entities.ACTIVE_DIRECTORY_ADMIN._class,
    });

    const sqlServerActiveDirectoryAdminRelationships =
      context.jobState.collectedRelationships;

    expect(sqlServerActiveDirectoryAdminRelationships.length).toBe(
      sqlServerActiveDirectoryAdminEntities.length,
    );
    expect(
      sqlServerActiveDirectoryAdminRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: relationships.SQL_SERVER_HAS_AD_ADMIN._type },
        },
      },
    });
  });
});
