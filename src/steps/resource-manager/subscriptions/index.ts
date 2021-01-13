import {
  Entity,
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  diagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { J1SubscriptionClient } from './client';
import {
  STEP_RM_SUBSCRIPTIONS,
  SUBSCRIPTION_ENTITY_METADATA,
} from './constants';
import { createSubscriptionEntity } from './converters';
export * from './constants';

export async function fetchSubscriptions(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1SubscriptionClient(instance.config, logger);

  await client.iterateSubscriptions(async (subscription) => {
    const subscriptionEntity = createSubscriptionEntity(
      webLinker,
      subscription,
    );
    await jobState.addEntity(subscriptionEntity);
    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      executionContext,
      subscriptionEntity,
    );
  });
}

export const subscriptionSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_SUBSCRIPTIONS,
    name: 'Subscriptions',
    entities: [
      SUBSCRIPTION_ENTITY_METADATA,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [...diagnosticSettingsRelationshipsForResource],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchSubscriptions,
  },
];
