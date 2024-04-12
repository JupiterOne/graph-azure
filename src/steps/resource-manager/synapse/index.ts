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
  createSqlPoolEntity,
  getSynapseEntityKey,
  createDataMaskingPolicyEntity,
  createDataMaskingRuleEntity,
  createSynapseKeyEntity,
} from './converter';
import { entities, steps } from '../subscriptions/constants';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  STEP_RM_KEYVAULT_VAULTS,
} from '../key-vault/constants';

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

  // create synapse service
  await jobState.addEntity(
    createSynapseServiceEntity(instance.id, instance.config.subscriptionId),
  );
  await jobState.iterateEntities(
    { _type: entities.SUBSCRIPTION._type },

    async (subscriptionEntity) => {
      if (
        subscriptionEntity._key == undefined &&
        !jobState.hasKey(subscriptionEntity._key)
      ) {
        throw new IntegrationMissingKeyError(
          `subscriptionEntity Key Missing ${subscriptionEntity._key}`,
        );
      }
      const synapseServiceKey = getSynapseEntityKey(
        instance.id as string,
        SynapseEntities.SYNAPSE_SERVICE._type,
      );
      if (!jobState.hasKey(synapseServiceKey)) {
        throw new IntegrationMissingKeyError(
          `Synapse Service Key Missing ${synapseServiceKey}`,
        );
      }
      // add subscription and synapse service relationship
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: subscriptionEntity._Key as string,
          fromType: entities.SUBSCRIPTION._type,
          toKey: synapseServiceKey,
          toType: SynapseEntities.SYNAPSE_SERVICE._type,
        }),
      );
    },
  );
}

export async function buildSynapseServiceWorkspaceRelationship(
  executionContext: IntegrationStepContext,
) {
  const { instance, jobState } = executionContext;

  const synapseServiceKey = getSynapseEntityKey(
    instance.id,
    SynapseEntities.SYNAPSE_SERVICE._type,
  );

  if (!jobState.hasKey(synapseServiceKey)) {
    throw new IntegrationMissingKeyError(
      `Synapse Service Key Missing ${synapseServiceKey}`,
    );
  }

  await jobState.iterateEntities(
    { _type: SynapseEntities.WORKSPACE._type },
    async (workspaceEntity) => {
      if (!jobState.hasKey(workspaceEntity._key)) {
        throw new IntegrationMissingKeyError(
          `Synapse Workspace Key Missing ${workspaceEntity._key}`,
        );
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: synapseServiceKey,
          fromType: SynapseEntities.SYNAPSE_SERVICE._type,
          toKey: workspaceEntity._key,
          toType: SynapseEntities.WORKSPACE._type,
        }),
      );
    },
  );
}

export async function buildSynapseServiceSqlPoolRelationship(
  executionContext: IntegrationStepContext,
) {
  const { instance, jobState } = executionContext;

  const synapseServiceKey = getSynapseEntityKey(
    instance.id,
    SynapseEntities.SYNAPSE_SERVICE._type,
  );

  if (!jobState.hasKey(synapseServiceKey)) {
    throw new IntegrationMissingKeyError(
      `Synapse Service Key Missing ${synapseServiceKey}`,
    );
  }

  await jobState.iterateEntities(
    { _type: SynapseEntities.SYNAPSE_SQL_POOL._type },
    async (sqlPoolEntity) => {
      if (!jobState.hasKey(sqlPoolEntity._key)) {
        throw new IntegrationMissingKeyError(
          `Synapse Sql Pool Key Missing ${sqlPoolEntity._key}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: synapseServiceKey,
          fromType: SynapseEntities.SYNAPSE_SERVICE._type,
          toKey: sqlPoolEntity._key,
          toType: SynapseEntities.SYNAPSE_SQL_POOL._type,
        }),
      );
    },
  );
}

export async function buildSynapseServiceKeysRelationship(
  executionContext: IntegrationStepContext,
) {
  const { instance, jobState } = executionContext;

  const synapseServiceKey = getSynapseEntityKey(
    instance.id,
    SynapseEntities.SYNAPSE_SERVICE._type,
  );

  if (!jobState.hasKey(synapseServiceKey)) {
    throw new IntegrationMissingKeyError(
      `Synapse Service Key Missing ${synapseServiceKey}`,
    );
  }
  await jobState.iterateEntities(
    { _type: SynapseEntities.SYNAPSE_KEYS._type },
    async (synapseKeyEntity) => {
      if (!jobState.hasKey(synapseKeyEntity._key)) {
        throw new IntegrationMissingKeyError(
          `Synapse Synapse_Key Key Missing ${synapseKeyEntity._key}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: synapseServiceKey,
          fromType: SynapseEntities.SYNAPSE_SERVICE._type,
          toKey: synapseKeyEntity._key,
          toType: SynapseEntities.SYNAPSE_KEYS._type,
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

export async function fetchSynapseKeys(
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

      await client.iterateSynapseKeys(
        instance.config.subscriptionId as string,
        resourceGroupName,
        workspaceName,
        async (synapseKey) => {
          const synapseKeyEntity = createSynapseKeyEntity(
            webLinker,
            synapseKey,
            workspaceUID,
          );
          await jobState.addEntity(synapseKeyEntity);
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
      const workspaceKey = getSynapseEntityKey(
        sqlPoolEntity.workspaceUID as string,
        SynapseEntities.WORKSPACE._type,
      );

      const hasSqlPoolKey = jobState.hasKey(sqlPoolEntity._key);
      const hasWorkSpaceKey = jobState.hasKey(workspaceKey);

      if (!hasSqlPoolKey || !hasWorkSpaceKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          WorkspaceKey : ${workspaceKey}
          SqlPoolKey: ${sqlPoolEntity._key}`,
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

export async function buildSynapseWorkspaceKeysRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: SynapseEntities.SYNAPSE_KEYS._type },
    async (synapseKeyEntity) => {
      const workspaceKey = getSynapseEntityKey(
        synapseKeyEntity.workspaceUID as string,
        SynapseEntities.WORKSPACE._type,
      );

      const hasSynapseKeyKey = jobState.hasKey(synapseKeyEntity._key);
      const hasWorkSpaceKey = jobState.hasKey(workspaceKey);

      if (!hasSynapseKeyKey || !hasWorkSpaceKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          WorkspaceKey : ${workspaceKey}
          Synapse_Key Key: ${synapseKeyEntity._key}`,
        );
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: workspaceKey,
          fromType: SynapseEntities.WORKSPACE._type,
          toKey: synapseKeyEntity._key,
          toType: SynapseEntities.SYNAPSE_KEYS._type,
        }),
      );
    },
  );
}

export async function buildVaultServiceSynapseKeyRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: SynapseEntities.SYNAPSE_KEYS._type },
    async (synapseKeyEntity) => {
      const keyVaultUrl = synapseKeyEntity.keyVaultUrl as string;
      const synapseKeyId = synapseKeyEntity.id as string;
      const vaultName = keyVaultUrl.split('/')[2].split('.')[0];
      const keyResourcePath = synapseKeyId.substring(
        0,
        synapseKeyId.indexOf('/Microsoft.Synapse'),
      );
      const vaultKey = `/${keyResourcePath}/Microsoft.KeyVault/vaults/${vaultName}`;

      if (
        !jobState.hasKey(vaultKey) ||
        !jobState.hasKey(synapseKeyEntity._key)
      ) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
           Error: Missing Key.
          Vault Key : ${vaultKey}
          Synapse_Key Key: ${synapseKeyEntity._key}`,
        );
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: vaultKey,
          fromType: KEY_VAULT_SERVICE_ENTITY_TYPE,
          toKey: synapseKeyEntity._key,
          toType: SynapseEntities.SYNAPSE_KEYS._type,
        }),
      );
    },
  );
}

export async function fetchSynapseDataMaskingPolicy(
  executionContext: IntegrationStepContext,
) {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const client = new SynapseClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: SynapseEntities.SYNAPSE_SQL_POOL._type },
    async (sqlPool) => {
      const sqlPoolId = sqlPool.id as string;
      const idPartitions = sqlPoolId.split('/');

      const resourceGroupName = idPartitions[4];
      const workspaceName = idPartitions[8];
      const sqlPoolName = idPartitions[10];

      await client.iterateDataMaskingPolicies(
        instance.config.subscriptionId as string,
        resourceGroupName,
        workspaceName,
        sqlPoolName,
        async (dataMaskingPolicy) => {
          const dataMaskingPolicyEntity = createDataMaskingPolicyEntity(
            webLinker,
            dataMaskingPolicy,
          );
          await jobState.addEntity(dataMaskingPolicyEntity);
        },
      );
    },
  );
}

export async function fetchSynapseDataMaskingRules(
  executionContext: IntegrationStepContext,
) {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);

  const client = new SynapseClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: SynapseEntities.SYNAPSE_SQL_POOL._type },
    async (sqlPool) => {
      const sqlPoolId = sqlPool.id as string;
      const idPartitions = sqlPoolId.split('/');

      const resourceGroupName = idPartitions[4];
      const workspaceName = idPartitions[8];
      const sqlPoolName = idPartitions[10];

      await client.iterateDataMaskingRules(
        instance.config.subscriptionId as string,
        resourceGroupName,
        workspaceName,
        sqlPoolName,
        async (dataMaskingRule) => {
          const dataMaskingRuleEntity = createDataMaskingRuleEntity(
            webLinker,
            dataMaskingRule,
          );
          await jobState.addEntity(dataMaskingRuleEntity);
        },
      );
    },
  );
}

export async function buildSynapseSQLPoolDataMaskingPilicyRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: SynapseEntities.SYNAPSE_DATA_MASKING_POLICY._type },
    async (dataMaskingPolicyEntity) => {
      const dataMaskingPolicyId = dataMaskingPolicyEntity.id as string;
      const sqlPoolId = dataMaskingPolicyId.split('/').slice(0, -2).join('/');
      const sqlPoolKey = getSynapseEntityKey(
        sqlPoolId,
        SynapseEntities.SYNAPSE_SQL_POOL._type,
      );

      if (!sqlPoolKey) {
        throw new IntegrationMissingKeyError(
          `Workspace key Missing ${sqlPoolKey}`,
        );
      }

      const hasDataMaskingPolicyKey = jobState.hasKey(
        dataMaskingPolicyEntity._key,
      );
      const hassqlPoolKey = jobState.hasKey(sqlPoolKey);

      if (!hasDataMaskingPolicyKey || !hassqlPoolKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          Data Masking Policy Key : ${dataMaskingPolicyEntity._key}
          Sql Pool Key: ${sqlPoolKey}`,
        );
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.ASSIGNED,
          fromKey: sqlPoolKey,
          fromType: SynapseEntities.SYNAPSE_SQL_POOL._type,
          toKey: dataMaskingPolicyEntity._key,
          toType: SynapseEntities.SYNAPSE_DATA_MASKING_POLICY._type,
        }),
      );
    },
  );
}

export async function buildSynapseSQLPoolDataMaskingRuleRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: SynapseEntities.SYNAPSE_DATA_MASKING_RULE._type },
    async (dataMaskingRuleEntity) => {
      const dataMaskingPolicyId = dataMaskingRuleEntity.id as string;
      const sqlPoolId = dataMaskingPolicyId.split('/').slice(0, -4).join('/');
      const sqlPoolKey = getSynapseEntityKey(
        sqlPoolId,
        SynapseEntities.SYNAPSE_SQL_POOL._type,
      );

      if (
        !jobState.hasKey(sqlPoolKey) ||
        !jobState.hasKey(dataMaskingRuleEntity._key)
      ) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          Data Masking Rule Key : ${dataMaskingRuleEntity._key}
          Sql Pool Key: ${sqlPoolKey}`,
        );
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: sqlPoolKey,
          fromType: SynapseEntities.SYNAPSE_SQL_POOL._type,
          toKey: dataMaskingRuleEntity._key,
          toType: SynapseEntities.SYNAPSE_DATA_MASKING_RULE._type,
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
    relationships: [SynapseRelationship.SUBSCRIPTION_HAS_SYNAPSE_SERVICE],
    dependsOn: [steps.SUBSCRIPTION],
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
    id: SYNAPSE_STEPS.SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP,
    name: 'Build Synapse Service and SQL Pool Relationship',
    entities: [],
    relationships: [SynapseRelationship.SYNAPSE_SERVICE_HAS_SQL_POOL],
    dependsOn: [SYNAPSE_STEPS.SYNAPSE_SERVICE, SYNAPSE_STEPS.SYNAPSE_SQL_POOL],
    executionHandler: buildSynapseServiceSqlPoolRelationship,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.SYNAPSE_SERVICE_KEY_RELATIONSHIP,
    name: 'Build Synapse Service and key Relationship',
    entities: [],
    relationships: [SynapseRelationship.SYNAPSE_SERVICE_KEYS],
    dependsOn: [SYNAPSE_STEPS.SYNAPSE_SERVICE, SYNAPSE_STEPS.SYNAPSE_KEYS],
    executionHandler: buildSynapseServiceKeysRelationship,
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
  {
    id: SYNAPSE_STEPS.SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP,
    name: 'Build Synapse Workspace and Keys Relationship',
    entities: [],
    relationships: [SynapseRelationship.SYNAPSE_WORKSPACE_HAS_KEYS],
    dependsOn: [SYNAPSE_STEPS.SYNAPSE_WORKSPACES, SYNAPSE_STEPS.SYNAPSE_KEYS],
    executionHandler: buildSynapseWorkspaceKeysRelationship,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_POLICY,
    name: 'Fetch Synapse Data Masking Policy',
    entities: [SynapseEntities.SYNAPSE_DATA_MASKING_POLICY],
    relationships: [],
    dependsOn: [SYNAPSE_STEPS.SYNAPSE_SQL_POOL],
    executionHandler: fetchSynapseDataMaskingPolicy,
    rolePermissions: [
      'Microsoft.Synapse/workspaces/sqlPools/dataMaskingPolicies/read',
    ],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_RULE,
    name: 'Fetch Synapse Data Masking Rule',
    entities: [SynapseEntities.SYNAPSE_DATA_MASKING_RULE],
    relationships: [],
    dependsOn: [SYNAPSE_STEPS.SYNAPSE_SQL_POOL],
    executionHandler: fetchSynapseDataMaskingRules,
    rolePermissions: [
      'Microsoft.Synapse/workspaces/sqlPools/dataMaskingPolicies/rules/read',
    ],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_RULE_RELATIONSHIP,
    name: 'Build Synapse Sql Pool Data Masking Rule Relationship',
    entities: [],
    relationships: [SynapseRelationship.SYNAPSE_SQL_POOL_HAS_DATA_MASKING_RULE],
    dependsOn: [
      SYNAPSE_STEPS.SYNAPSE_SQL_POOL,
      SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_RULE,
    ],
    executionHandler: buildSynapseSQLPoolDataMaskingRuleRelationship,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP,
    name: 'Build Synapse SQL Pool Data Masking Policy Relationship',
    entities: [],
    relationships: [
      SynapseRelationship.SYNAPSE_SQL_POOL_ASSIGNED_DATA_MASKING_POLICY,
    ],
    dependsOn: [
      SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_POLICY,
      SYNAPSE_STEPS.SYNAPSE_SQL_POOL,
    ],
    executionHandler: buildSynapseSQLPoolDataMaskingPilicyRelationship,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.SYNAPSE_KEYS,
    name: 'Fetch Synapse Keys',
    entities: [SynapseEntities.SYNAPSE_KEYS],
    relationships: [],
    dependsOn: [SYNAPSE_STEPS.SYNAPSE_WORKSPACES],
    executionHandler: fetchSynapseKeys,
    rolePermissions: ['Microsoft.Synapse/workspaces/keys/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
  {
    id: SYNAPSE_STEPS.KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP,
    name: 'Build Key Vault Service Synapse Keys Relationship',
    entities: [],
    relationships: [SynapseRelationship.VALUT_SERVICE_HAS_SYNAPSE_KEY],
    dependsOn: [SYNAPSE_STEPS.SYNAPSE_KEYS, STEP_RM_KEYVAULT_VAULTS],
    executionHandler: buildVaultServiceSynapseKeyRelationship,
    rolePermissions: [],
    ingestionSourceId: INGESTION_SOURCE_IDS.SYNAPSE,
  },
];
