import { Entity, Relationship } from '@jupiterone/integration-sdk-core';
import { Recording } from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../../test/createMockAzureStepExecutionContext';
import { IntegrationConfig } from '../../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../../active-directory';
import {
  fetchPostgreSQLDatabases,
  fetchPostgreSQLServers,
  fetchPostgreSqlServerFirewallRules,
} from '.';
import { PostgreSQLEntities, PostgreSQLRelationships } from './constants';
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

describe('rm-database-postgresql-servers', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    return { accountEntity };
  }

  function separatePostgreSqlServerEntities(entities: Entity[]) {
    const {
      targets: postgreSqlEntities,
      rest: restAfterPostgreSql,
    } = filterGraphObjects(
      entities,
      (e) => e._type === PostgreSQLEntities.SERVER._type,
    );
    // Don't care how many diagnostic settings exist... just want to be sure no additional entities exist.
    const {
      // diagnosticSettingsEntities,
      rest: restAfterDiagnosticSettings,
    } = separateDiagnosticSettingsEntities(restAfterPostgreSql);
    return {
      postgreSqlEntities,
      rest: restAfterDiagnosticSettings,
    };
  }

  function separatePostgresQLServerRelationships(
    relationships: Relationship[],
  ) {
    // Don't care how many diagnostic settings exist... just want to be sure no additional relationships exist.
    const {
      // diagnosticSettingsRelationships,
      // diagnosticSettingsStorageRelationships,
      rest: restAfterDiagnosticSettings,
    } = separateDiagnosticSettingsRelationships(relationships);
    return {
      rest: restAfterDiagnosticSettings,
    };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-database-postgresql-servers',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity } = getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchPostgreSQLServers(context);

    const {
      postgreSqlEntities,
      rest: restEntities,
    } = separatePostgreSqlServerEntities(context.jobState.collectedEntities);

    expect(postgreSqlEntities.length).toBeGreaterThan(0);
    expect(postgreSqlEntities).toMatchGraphObjectSchema({
      _class: PostgreSQLEntities.SERVER._class,
    });

    expect(restEntities).toHaveLength(0);

    const { rest: restRelationships } = separatePostgresQLServerRelationships(
      context.jobState.collectedRelationships,
    );

    expect(restRelationships).toHaveLength(0);
  });
});

describe('rm-database-postgresql-databases', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchPostgreSQLServers(context);

    const j1devPostgreSqlServerEntities = context.jobState.collectedEntities.filter(
      (e) =>
        e._type === PostgreSQLEntities.SERVER._type &&
        e.name === 'j1dev-psqlserver',
    );
    expect(j1devPostgreSqlServerEntities).toHaveLength(1);

    return { accountEntity, serverEntity: j1devPostgreSqlServerEntities[0] };
  }
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-database-postgresql-databases',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, serverEntity } = await getSetupEntities(
      configFromEnv,
    );

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [serverEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchPostgreSQLDatabases(context);

    const postgreSqlDatatbaseEntities = context.jobState.collectedEntities;
    expect(postgreSqlDatatbaseEntities.length).toBeGreaterThan(0);
    expect(postgreSqlDatatbaseEntities).toMatchGraphObjectSchema({
      _class: PostgreSQLEntities.DATABASE._class,
    });

    const postgreSqlServerDatabaseRelationships =
      context.jobState.collectedRelationships;
    expect(postgreSqlServerDatabaseRelationships.length).toBe(
      postgreSqlDatatbaseEntities.length,
    );
    expect(
      postgreSqlServerDatabaseRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE
                ._type,
          },
        },
      },
    });
  });
});

describe('rm-database-postgresql-server-firewall-rules', () => {
  async function getSetupEntities() {
    const accountEntity = getMockAccountEntity(configFromEnv);

    const setupContext = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchPostgreSQLServers(setupContext);
    const j1devPostgreSqlServerEntities = setupContext.jobState.collectedEntities.filter(
      (e) =>
        e._type === PostgreSQLEntities.SERVER._type &&
        e.displayName === 'j1dev-psqlserver',
    );
    expect(j1devPostgreSqlServerEntities.length).toBe(1);
    const sqlServerEntity = j1devPostgreSqlServerEntities[0];

    return { accountEntity, sqlServerEntity };
  }

  test('step', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-database-postgresql-server-firewall-rules',
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

    await fetchPostgreSqlServerFirewallRules(context);

    const postgreSqlServerFirewallRuleEntities =
      context.jobState.collectedEntities;

    expect(postgreSqlServerFirewallRuleEntities.length).toBeGreaterThan(0);
    expect(postgreSqlServerFirewallRuleEntities).toMatchGraphObjectSchema({
      _class: PostgreSQLEntities.FIREWALL_RULE._class,
    });

    const postgreSqlServerFirewallRuleRelationships =
      context.jobState.collectedRelationships;

    expect(postgreSqlServerFirewallRuleRelationships.length).toBe(
      postgreSqlServerFirewallRuleEntities.length,
    );
    expect(
      postgreSqlServerFirewallRuleRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_FIREWALL_RULE._type,
          },
        },
      },
    });
  });
});
