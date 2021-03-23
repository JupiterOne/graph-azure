import {
  createDirectRelationship,
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../../azure';
import { IntegrationConfig, IntegrationStepContext } from '../../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../../active-directory';
import { createDatabaseEntity, createDbServerEntity } from '../converters';
import { SQLClient } from './client';
import { steps, entities, relationships } from './constants';
import {
  createSqlServerFirewallRuleEntity,
  setAuditingStatus,
  setDatabaseEncryption,
  setServerSecurityAlerting,
} from './converters';
import createResourceGroupResourceRelationship from '../../utils/createResourceGroupResourceRelationship';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  diagnosticSettingsRelationshipsForResource,
} from '../../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../../resources/constants';

export async function fetchSQLDatabases(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new SQLClient(instance.config, logger);

  await client.iterateServers(async (server) => {
    const serverEntity = createDbServerEntity(
      webLinker,
      server,
      entities.SERVER._type,
    );

    setAuditingStatus(
      serverEntity,
      await client.fetchServerAuditingStatus(server),
    );
    setServerSecurityAlerting(
      serverEntity,
      await client.fetchServerSecurityAlertPolicies(server),
    );

    await jobState.addEntity(serverEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      serverEntity,
    );

    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      executionContext,
      serverEntity,
    );

    try {
      await client.iterateDatabases(server, async (database) => {
        const databaseEntity = createDatabaseEntity(
          webLinker,
          database,
          entities.DATABASE._type,
        );

        setDatabaseEncryption(
          databaseEntity,
          await client.fetchDatabaseEncryption(server, database),
        );
        setAuditingStatus(
          databaseEntity,
          await client.fetchDatabaseAuditingStatus(server, database),
        );

        await jobState.addEntity(databaseEntity);

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: serverEntity,
            to: databaseEntity,
          }),
        );
      });
    } catch (err) {
      logger.warn(
        { err, server: { id: server.id, type: server.type } },
        'Failure fetching databases for server',
      );
      // In the case this is a transient failure, ideally we would avoid
      // deleting previously ingested databases for this server. That would
      // require that we process each server independently, and have a way
      // to communicate to the synchronizer that only a subset is partial.
    }
  });
}

export async function fetchSQLServerFirewallRules(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new SQLClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: entities.SERVER._type },
    async (sqlServerEntity) => {
      await client.iteraetServerFirewallRules(
        {
          id: sqlServerEntity.id as string,
          name: sqlServerEntity.name as string,
        },
        async (firewallRule) => {
          const firewallRuleEntity = await jobState.addEntity(
            createSqlServerFirewallRuleEntity(firewallRule),
          );
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: sqlServerEntity,
              to: firewallRuleEntity,
              properties: {
                _type: relationships.SQL_SERVER_HAS_FIREWALL_RULE._type,
              },
            }),
          );
        },
      );
    },
  );
}

export const sqlSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: steps.DATABASES,
    name: 'SQL Databases',
    entities: [
      entities.SERVER,
      entities.DATABASE,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      relationships.RESOURCE_GROUP_HAS_SQL_SERVER,
      relationships.SQL_SERVER_HAS_SQL_DATABASE,
      ...diagnosticSettingsRelationshipsForResource,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchSQLDatabases,
  },
  {
    id: steps.SERVER_FIREWALL_RULES,
    name: 'SQL Server Firewall Rules',
    entities: [entities.FIREWALL_RULE],
    relationships: [relationships.SQL_SERVER_HAS_FIREWALL_RULE],
    dependsOn: [steps.DATABASES],
    executionHandler: fetchSQLServerFirewallRules,
  },
];
