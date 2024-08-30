import {
  createDirectRelationship,
  RelationshipClass,
  getRawData,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources/constants';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { BatchClient } from './client';
import {
  BatchEntities,
  BatchAccountRelationships,
  STEP_RM_BATCH_ACCOUNT,
  STEP_RM_BATCH_POOL,
  STEP_RM_BATCH_APPLICATION,
  STEP_RM_BATCH_CERTIFICATE,
  STEP_RM_BATCH_ACCOUNT_DIAGNOSTIC_SETTINGS,
} from './constants';
import {
  createBatchAccountEntity,
  createBatchApplicationEntity,
  createBatchPoolEntity,
  createBatchCertificateEntity,
} from './converters';
import { resourceGroupName } from '../../../azure/utils';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { BatchAccount } from '@azure/arm-batch';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { steps as storageSteps } from '../storage/constants';

export async function fetchBatchAccounts(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new BatchClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      const { name } = resourceGroupEntity;
      await client.iterateBatchAccounts(
        { resourceGroupName: name as string },
        async (domain) => {
          const batchAccountEntity = createBatchAccountEntity(
            webLinker,
            domain,
          );
          await jobState.addEntity(batchAccountEntity);

          await createResourceGroupResourceRelationship(
            executionContext,
            batchAccountEntity,
          );
        },
      );
    },
  );
}

async function fetchBatchAccountsDiagnosticSettings(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: BatchEntities.BATCH_ACCOUNT._type },
    async (batchAccount) => {
      await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
        executionContext,
        batchAccount,
      );
    },
  );
}

export async function fetchBatchPools(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new BatchClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: BatchEntities.BATCH_ACCOUNT._type },
    async (batchAccountEntity) => {
      const { id, name } = batchAccountEntity;
      const resourceGroup = resourceGroupName(id, true)!;

      await client.iterateBatchPools(
        {
          resourceGroupName: resourceGroup,
          batchAccountName: name as string,
        },
        async (batchPool) => {
          const batchPoolEntity = createBatchPoolEntity(webLinker, batchPool);
          await jobState.addEntity(batchPoolEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: batchAccountEntity,
              to: batchPoolEntity,
            }),
          );
        },
      );
    },
  );
}

export async function fetchBatchApplications(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new BatchClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: BatchEntities.BATCH_ACCOUNT._type },
    async (batchAccountEntity) => {
      const { id, name } = batchAccountEntity;
      const resourceGroup = resourceGroupName(id, true)!;
      const batchAccount = getRawData<BatchAccount>(batchAccountEntity);

      if (batchAccount?.autoStorage) {
        await client.iterateBatchApplications(
          {
            resourceGroupName: resourceGroup,
            batchAccountName: name as string,
          },
          async (batchApplication) => {
            const batchApplicationEntity = createBatchApplicationEntity(
              webLinker,
              batchApplication,
            );
            await jobState.addEntity(batchApplicationEntity);

            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: batchAccountEntity,
                to: batchApplicationEntity,
              }),
            );
          },
        );
      }
    },
  );
}

export async function fetchBatchCertificates(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new BatchClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: BatchEntities.BATCH_ACCOUNT._type },
    async (batchAccountEntity) => {
      const { id, name } = batchAccountEntity;
      const resourceGroup = resourceGroupName(id, true)!;

      await client.iterateBatchCertificates(
        {
          resourceGroupName: resourceGroup,
          batchAccountName: name as string,
        },
        async (batchCertificate) => {
          const batchCertificateEntity = createBatchCertificateEntity(
            webLinker,
            batchCertificate,
          );
          await jobState.addEntity(batchCertificateEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: batchAccountEntity,
              to: batchCertificateEntity,
            }),
          );
        },
      );
    },
  );
}

export const batchSteps: AzureIntegrationStep[] = [
  {
    id: STEP_RM_BATCH_ACCOUNT,
    name: 'Batch Accounts',
    entities: [BatchEntities.BATCH_ACCOUNT],
    relationships: [BatchAccountRelationships.RESOURCE_GROUP_HAS_BATCH_ACCOUNT],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchBatchAccounts,
    rolePermissions: ['Microsoft.Batch/batchAccounts/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.BATCH,
  },
  {
    id: STEP_RM_BATCH_ACCOUNT_DIAGNOSTIC_SETTINGS,
    name: 'Batch Accounts Diagnostic Settings',
    entities: [...diagnosticSettingsEntitiesForResource],
    relationships: [
      ...getDiagnosticSettingsRelationshipsForResource(
        BatchEntities.BATCH_ACCOUNT,
      ),
    ],
    dependsOn: [STEP_RM_BATCH_ACCOUNT, storageSteps.STORAGE_ACCOUNTS],
    executionHandler: fetchBatchAccountsDiagnosticSettings,
    rolePermissions: ['Microsoft.Insights/DiagnosticSettings/Read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.BATCH,
  },
  {
    id: STEP_RM_BATCH_POOL,
    name: 'Batch Pools',
    entities: [BatchEntities.BATCH_POOL],
    relationships: [BatchAccountRelationships.BATCH_ACCOUNT_HAS_BATCH_POOL],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      STEP_RM_BATCH_ACCOUNT,
    ],
    executionHandler: fetchBatchPools,
    rolePermissions: ['Microsoft.Batch/batchAccounts/pools/read'],
  },
  {
    id: STEP_RM_BATCH_APPLICATION,
    name: 'Batch Applications',
    entities: [BatchEntities.BATCH_APPLICATION],
    relationships: [
      BatchAccountRelationships.BATCH_ACCOUNT_HAS_BATCH_APPLICATION,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      STEP_RM_BATCH_ACCOUNT,
    ],
    executionHandler: fetchBatchApplications,
    rolePermissions: ['Microsoft.Batch/batchAccounts/applications/read'],
  },
  {
    id: STEP_RM_BATCH_CERTIFICATE,
    name: 'Batch Certificates',
    entities: [BatchEntities.BATCH_CERTIFICATE],
    relationships: [
      BatchAccountRelationships.BATCH_ACCOUNT_HAS_BATCH_CERTIFICATE,
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      STEP_RM_BATCH_ACCOUNT,
    ],
    executionHandler: fetchBatchCertificates,
    rolePermissions: ['Microsoft.Batch/batchAccounts/certificates/read'],
  },
];
