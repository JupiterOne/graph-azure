import { AzureIntegrationStep } from '../../../types';
import { locationSteps } from './executionHandlers/locations';
import { fetchSubscriptionSteps } from './executionHandlers/subscriptions';
import { usageDetailsSteps } from './executionHandlers/usageDetails';

export const subscriptionSteps: AzureIntegrationStep[] = [
  ...fetchSubscriptionSteps,
  ...locationSteps,
  ...usageDetailsSteps,
];
