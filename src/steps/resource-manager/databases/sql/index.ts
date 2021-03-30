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
import { SQLClient } from './client';
import { steps, entities, relationships } from './constants';
import {
  createSqlServerFirewallRuleEntity,
  createSqlServerActiveDirectoryAdmin,
  setAuditingStatus,
  setDatabaseEncryption,
  setServerSecurityAlerting,
  setServerEncryptionProtector,
} from './converters';
import createResourceGroupResourceRelationship from '../../utils/createResourceGroupResourceRelationship';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../../resources/constants';
import { Server } from '@azure/arm-sql/esm/models';

export async function fetchSQLServers(
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
    setServerEncryptionProtector(
      serverEntity,
      await client.fetchServerEncryptionProtector({
        name: server.name!,
        id: server.id!,
      }),
    );

    // Per Microsoft Azure documentation, TLS is always enabled on SQL servers:
    // https://docs.microsoft.com/en-us/azure/azure-sql/database/security-overview#transport-layer-security-encryption-in-transit
    serverEntity.secureTransport = true;

    await jobState.addEntity(serverEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      serverEntity,
    );
  });
}

export async function fetchSQLServerDiagnosticSettings(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: entities.SERVER._type },
    async (serverEntity) => {
      await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
        executionContext,
        serverEntity,
      );
    },
  );
}

export async function fetchSQLDatabases(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new SQLClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: entities.SERVER._type },
    async (serverEntity) => {
      const server = getRawData<Server>(serverEntity, 'default');
      if (!server) return;

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
    },
  );
}

export async function fetchSQLServerFirewallRules(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new SQLClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: entities.SERVER._type },
    async (sqlServerEntity) => {
      await client.iterateServerFirewallRules(
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

export async function fetchSQLServerActiveDirectoryAdmins(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new SQLClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: entities.SERVER._type },
    async (sqlServerEntity) => {
      await client.iterateServerActiveDirectoryAdministrators(
        {
          id: sqlServerEntity.id as string,
          name: sqlServerEntity.name as string,
        },
        async (admin) => {
          const adminEntity = await jobState.addEntity(
            createSqlServerActiveDirectoryAdmin(admin),
          );
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: sqlServerEntity,
              to: adminEntity,
            }),
          );

          // TODO create IS mapped relationship between AD Admin and principal.
        },
      );
    },
  );
}

export const sqlSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: steps.SERVERS,
    name: 'SQL Servers',
    entities: [entities.SERVER],
    relationships: [relationships.RESOURCE_GROUP_HAS_SQL_SERVER],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchSQLServers,
  },
  {
    id: steps.SERVER_DIAGNOSTIC_SETTINGS,
    name: 'SQL Server Diagnostic Settings',
    entities: [...diagnosticSettingsEntitiesForResource],
    relationships: [
      ...getDiagnosticSettingsRelationshipsForResource(entities.SERVER),
    ],
    dependsOn: [STEP_AD_ACCOUNT, steps.SERVERS],
    executionHandler: fetchSQLServerDiagnosticSettings,
  },
  {
    id: steps.DATABASES,
    name: 'SQL Databases',
    entities: [entities.DATABASE],
    relationships: [relationships.SQL_SERVER_HAS_SQL_DATABASE],
    dependsOn: [STEP_AD_ACCOUNT, steps.SERVERS],
    executionHandler: fetchSQLDatabases,
  },
  {
    id: steps.SERVER_FIREWALL_RULES,
    name: 'SQL Server Firewall Rules',
    entities: [entities.FIREWALL_RULE],
    relationships: [relationships.SQL_SERVER_HAS_FIREWALL_RULE],
    dependsOn: [steps.SERVERS],
    executionHandler: fetchSQLServerFirewallRules,
  },
  {
    id: steps.SERVER_AD_ADMINS,
    name: 'SQL Server Active Directory Admins',
    entities: [entities.ACTIVE_DIRECTORY_ADMIN],
    relationships: [relationships.SQL_SERVER_HAS_AD_ADMIN],
    dependsOn: [steps.SERVERS],
    executionHandler: fetchSQLServerActiveDirectoryAdmins,
  },
];
