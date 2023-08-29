import {
  IntegrationConfigLoadError,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../../azure';
import {
  IntegrationStepContext,
  AzureIntegrationStep,
} from '../../../../types';
import { getAccountEntity } from '../../../active-directory';
import { STEP_AD_ACCOUNT } from '../../../active-directory/constants';
import { J1SubscriptionClient } from '../client';
import { entities, steps } from '../constants';
import { createSubscriptionEntity } from '../converters';
import { steps as storageSteps } from '../../storage/constants';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { INGESTION_SOURCE_IDS } from '../../../../constants';

export async function fetchSubscription(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1SubscriptionClient(instance.config, logger);

  if (!instance.config.subscriptionId) {
    // This should never happen as getStepStartStates should turn off this step if there is no subscriptionId
    throw new IntegrationConfigLoadError(
      'You need to provide a subscriptionId in order to ingest a subscription',
    );
  }
  const subscription = await client.fetchSubscription(
    instance.config.subscriptionId,
  );
  if (subscription) {
    const subscriptionEntity = createSubscriptionEntity(
      webLinker,
      subscription,
    );
    await jobState.addEntity(subscriptionEntity);
  } else {
    throw new IntegrationError({
      message:
        'Unable to find the subscription using the provided "Subscription ID"',
      code: 'MISSING_SUBSCRIPTION',
    });
  }
}

export async function fetchSubscriptionDiagnosticSettings(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: entities.SUBSCRIPTION._type },
    async (subscriptionEntity) => {
      await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
        executionContext,
        subscriptionEntity,
      );
    },
  );
}

export const fetchSubscriptionSteps: AzureIntegrationStep[] = [
  {
    id: steps.SUBSCRIPTION,
    name: 'Subscriptions',
    entities: [entities.SUBSCRIPTION],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchSubscription,
    rolePermissions: ['Microsoft.Resources/subscriptions/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.SUBSCRIPTIONS,
  },
  {
    id: steps.SUBSCRIPTION_DIAGNOSTIC_SETTINGS,
    name: 'Subscription Diagnostic Settings',
    entities: [...diagnosticSettingsEntitiesForResource],
    relationships: [
      ...getDiagnosticSettingsRelationshipsForResource(entities.SUBSCRIPTION),
    ],
    dependsOn: [steps.SUBSCRIPTION, storageSteps.STORAGE_ACCOUNTS],
    executionHandler: fetchSubscriptionDiagnosticSettings,
    rolePermissions: ['Microsoft.Insights/DiagnosticSettings/Read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.SUBSCRIPTIONS,
  },
];
