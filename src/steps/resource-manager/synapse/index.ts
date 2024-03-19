import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { AzureIntegrationStep, IntegrationStepContext } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { SynapseClient } from './client';
import {
  SYNAPSE_STEPS,
  SynapseEntities,
  SynapseRelationship,
} from './constant';
import {
  createSynapseServiceEntity,
  createWorkspaceEntity,
  getSynapseServiceKey,
  createSqlPoolEntity,
  getSynapseWorkspaceKey,
} from './converter';

export async function fetchSynapseWorkspaces(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const client = new SynapseClient(instance.config, logger);

  await client.iterateWorkspaces(
    instance.config.subscriptionId as string,
    async (workspace) => {
      const workSpaceEntity = createWorkspaceEntity(webLinker, workspace);
      await jobState.addEntity(workSpaceEntity);
    },
  );
}

export async function createSynapseService(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = executionContext;
  await jobState.addEntity(createSynapseServiceEntity(instance.id));
}

export async function buildSynapseServiceWorkspaceRelationship(
  executionContext: IntegrationStepContext,
) {
  const { instance, jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: SynapseEntities.WORKSPACE._type },
    async (workspaceEntity) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: getSynapseServiceKey(instance.id),
          fromType: SynapseEntities.SYNAPSE_SERVICE._type,
          toKey: workspaceEntity._key,
          toType: SynapseEntities.WORKSPACE._type,
        }),
      );
    },
  );
}

export async function fetchSynapseSqlPool(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const client = new SynapseClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: SynapseEntities.WORKSPACE._type },
    async (workspaceEntity) => {
      const resourceGroupName = workspaceEntity.resourceGroupName as string;
      const workspaceName = workspaceEntity.displayName as string;
      const workspaceUID = workspaceEntity.workspaceUID as string;

      if (!resourceGroupName || !workspaceName || !workspaceUID) {
        throw new IntegrationMissingKeyError(
          `One or more required values are undefined:
          - Workspace Name: ${workspaceName}
          - Resource Group Name: ${resourceGroupName}
          - Workspace UUID: ${workspaceUID}
         `,
        );
      }

      await client.iterateSqlPools(
        instance.config.subscriptionId as string,
        resourceGroupName,
        workspaceName,
        async (sqlPool) => {
          const sqlPoolEntity = createSqlPoolEntity(
            webLinker,
            sqlPool,
            workspaceUID,
          );
          await jobState.addEntity(sqlPoolEntity);
        },
      );
    },
  );
}

export async function buildSynapseWorkspaceSQLPoolRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: SynapseEntities.SYNAPSE_SQL_POOL._type },
    async (sqlPoolEntity) => {
      const workspaceKey = getSynapseWorkspaceKey(
        sqlPoolEntity.workspaceUID as string,
      );

      if (!workspaceKey) {
        throw new IntegrationMissingKeyError(
          `Workspace key Missing ${workspaceKey}`,
        );
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: workspaceKey,
          fromType: SynapseEntities.WORKSPACE._type,
          toKey: sqlPoolEntity._key,
          toType: SynapseEntities.SYNAPSE_SQL_POOL._type,
        }),
      );
    },
  );
}

export const SynapseSteps: AzureIntegrationStep[] = [
  {
    id: SYNAPSE_STEPS.SYNAPSE_WORKSPACES,
    name: 'Synapse Workspaces',
    entities: [SynapseEntities.WORKSPACE],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchSynapseWorkspaces,
    rolePermissions: ['Microsoft.Synapse/workspaces/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.SYNAPSE_SERVICE,
    name: 'Synapse Service',
    entities: [SynapseEntities.SYNAPSE_SERVICE],
    relationships: [],
    dependsOn: [],
    executionHandler: createSynapseService,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP,
    name: 'Build Synapse Service and Workspace Relationship',
    entities: [],
    relationships: [SynapseRelationship.SYNAPSE_SERVICE_HAS_WORKSPACE],
    dependsOn: [
      SYNAPSE_STEPS.SYNAPSE_SERVICE,
      SYNAPSE_STEPS.SYNAPSE_WORKSPACES,
    ],
    executionHandler: buildSynapseServiceWorkspaceRelationship,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.SYNAPSE_SQL_POOL,
    name: 'Synapse SQL Pool',
    entities: [SynapseEntities.SYNAPSE_SQL_POOL],
    relationships: [],
    dependsOn: [SYNAPSE_STEPS.SYNAPSE_WORKSPACES],
    executionHandler: fetchSynapseSqlPool,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP,
    name: 'Build Synapse Workspace and SQL Pool Relationship',
    entities: [],
    relationships: [SynapseRelationship.SYNAPSE_WORKSPACE_HAS_SQL_POOL],
    dependsOn: [
      SYNAPSE_STEPS.SYNAPSE_WORKSPACES,
      SYNAPSE_STEPS.SYNAPSE_SQL_POOL,
    ],
    executionHandler: buildSynapseWorkspaceSQLPoolRelationship,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
];
