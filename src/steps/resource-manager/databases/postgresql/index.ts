import {
  createDirectRelationship,
  getRawData,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../../azure';
import {
  AzureIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { getAccountEntity } from '../../../active-directory';
import { STEP_AD_ACCOUNT } from '../../../active-directory/constants';
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
import { INGESTION_SOURCE_IDS } from '../../../../constants';
import { steps as storageSteps } from '../../storage/constants';

export async function fetchPostgreSQLServers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  //INT-10292
  try {
    const accountEntity = await getAccountEntity(jobState);
    const webLinker = createAzureWebLinker(
      accountEntity.defaultDomain as string,
    );
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
  } catch (error) {
    logger.info(
      { error },
      'An error happened while executing fetchPostgreSQLServers',
    );
    throw error;
  }
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

export const postgreSqlSteps: AzureIntegrationStep[] = [
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
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      storageSteps.STORAGE_ACCOUNTS,
    ],
    executionHandler: fetchPostgreSQLServers,
    rolePermissions: [
      'Microsoft.Insights/DiagnosticSettings/Read',
      'Microsoft.DBforPostgreSQL/servers/read',
    ],
    ingestionSourceId: INGESTION_SOURCE_IDS.DATABASES,
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
    rolePermissions: ['Microsoft.DBforPostgreSQL/servers/databases/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.DATABASES,
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
    rolePermissions: ['Microsoft.DBforPostgreSQL/servers/firewallRules/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.DATABASES,
  },
];
