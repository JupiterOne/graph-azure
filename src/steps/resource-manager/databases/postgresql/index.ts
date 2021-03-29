import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../../azure';
import { IntegrationConfig, IntegrationStepContext } from '../../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../../active-directory';
import { createDatabaseEntity, createDbServerEntity } from '../converters';
import { PostgreSQLClient } from './client';
import {
  PostgreSQLEntities,
  PostgreSQLRelationships,
  steps,
} from './constants';
import createResourceGroupResourceRelationship from '../../utils/createResourceGroupResourceRelationship';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../../resources/constants';
import { Server } from '@azure/arm-postgresql/esm/models';
import { createPosgreSqlServerFirewallRuleEntity } from './converters';

export async function fetchPostgreSQLServers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new PostgreSQLClient(instance.config, logger);

  await client.iterateServers(async (server) => {
    const serverConfigurations = await client.getServerConfigurations({
      name: server.name!,
      id: server.id!,
    });
    const serverEntity = createDbServerEntity(
      webLinker,
      server,
      PostgreSQLEntities.SERVER._type,
      serverConfigurations,
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
  });
}

export async function fetchPostgreSQLDatabases(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new PostgreSQLClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: PostgreSQLEntities.SERVER._type },
    async (serverEntity) => {
      const server = getRawData<Server>(serverEntity);

      if (server) {
        await client.iterateDatabases(server, async (database) => {
          const databaseEntity = createDatabaseEntity(
            webLinker,
            database,
            PostgreSQLEntities.DATABASE._type,
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
      }
    },
  );
}

export async function fetchPostgreSqlServerFirewallRules(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new PostgreSQLClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: PostgreSQLEntities.SERVER._type },
    async (sqlServerEntity) => {
      await client.iterateServerFirewallRules(
        {
          id: sqlServerEntity.id as string,
          name: sqlServerEntity.name as string,
        },
        async (firewallRule) => {
          const firewallRuleEntity = await jobState.addEntity(
            createPosgreSqlServerFirewallRuleEntity(firewallRule),
          );
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: sqlServerEntity,
              to: firewallRuleEntity,
              properties: {
                _type:
                  PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_FIREWALL_RULE
                    ._type,
              },
            }),
          );
        },
      );
    },
  );
}

export const postgreSqlSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: steps.SERVERS,
    name: 'PostgreSQL Servers',
    entities: [
      PostgreSQLEntities.SERVER,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      PostgreSQLRelationships.RESOURCE_GROUP_HAS_POSTGRESQL_SERVER,
      ...getDiagnosticSettingsRelationshipsForResource(
        PostgreSQLEntities.SERVER,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchPostgreSQLServers,
  },
  {
    id: steps.DATABASES,
    name: 'PostgreSQL Databases',
    entities: [PostgreSQLEntities.DATABASE],
    relationships: [
      PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_POSTGRESQL_DATABASE,
    ],
    dependsOn: [STEP_AD_ACCOUNT, steps.SERVERS],
    executionHandler: fetchPostgreSQLDatabases,
  },
  {
    id: steps.SERVER_FIREWALL_RULES,
    name: 'PostgreSQL Server Firewall Rules',
    entities: [PostgreSQLEntities.FIREWALL_RULE],
    relationships: [
      PostgreSQLRelationships.POSTGRESQL_SERVER_HAS_FIREWALL_RULE,
    ],
    dependsOn: [steps.SERVERS],
    executionHandler: fetchPostgreSqlServerFirewallRules,
  },
];
