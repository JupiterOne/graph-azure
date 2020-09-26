import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
  // createDirectRelationship,
  // RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { BatchClient } from './client';
import {
  BatchEntities,
  BatchAccountRelationships,
  STEP_RM_BATCH_ACCOUNT,
  // STEP_RM_BATCH_POOL,
  // STEP_RM_BATCH_APPLICATION
} from './constants';
import {
  createBatchAccountEntity,
  // createBatchPoolEntity
} from './converters';
// import {
//   resourceGroupName,
// } from '../../../azure/utils';

export * from './constants';

export async function fetchBatchAccounts(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new BatchClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      const { name } = resourceGroupEntity;
      await client.iterateBatchAccounts(
        ({ name } as unknown) as { name: string },
        async (domain) => {
          const batchAccountEntity = createBatchAccountEntity(
            webLinker,
            domain,
          );
          await jobState.addEntity(batchAccountEntity);

          await jobState.addRelationship(
            await createResourceGroupResourceRelationship(
              executionContext,
              batchAccountEntity,
            ),
          );
        },
      );
    },
  );
}

export const batchSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_BATCH_ACCOUNT,
    name: 'Batch Accounts',
    entities: [BatchEntities.BATCH_ACCOUNT],
    relationships: [BatchAccountRelationships.RESOURCE_GROUP_HAS_BATCH_ACCOUNT],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchBatchAccounts,
  },
];
