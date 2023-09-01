import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../../azure';
import {
  AzureIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { getAccountEntity } from '../../../active-directory';
import { J1SubscriptionClient } from '../client';
import { entities, relationships, steps } from '../constants';
import { createSubscriptionUsageEntity } from '../converters';
import { INGESTION_SOURCE_IDS } from '../../../../constants';

export async function fetchSubscriptionUsageDetails(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1SubscriptionClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: entities.SUBSCRIPTION._type },
    async (subscription) => {
      let usageDetails;
      try {
        usageDetails = await client.getUsageDetails(subscription.id as string);
      } catch (error) {
        logger.warn({ error }, "Can't get subscription usage details.");
      }
      if (usageDetails) {
        const usageEntity = await jobState.addEntity(
          createSubscriptionUsageEntity(webLinker, usageDetails[0]),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            from: subscription,
            to: usageEntity,
            _class: RelationshipClass.HAS,
          }),
        );
      }
    },
  );
}
export const usageDetailsSteps: AzureIntegrationStep[] = [
  {
    id: steps.USAGE_DETAILS,
    name: 'Subscription Usage Details',
    entities: [entities.USAGE],
    relationships: [relationships.SUBSCRIPTION_HAS_USAGE_DETAILS],
    dependsOn: [steps.SUBSCRIPTION, steps.SUBSCRIPTION_DIAGNOSTIC_SETTINGS],
    executionHandler: fetchSubscriptionUsageDetails,
    rolePermissions: ['Microsoft.Consumption/usageDetails/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.SUBSCRIPTIONS,
  },
];
