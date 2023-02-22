import { AzureIntegrationStep } from '../../../types';
import { locationSteps } from './executionHandlers/locations';
import { fetchSubscriptionSteps } from './executionHandlers/subscriptions';

export const subscriptionSteps: AzureIntegrationStep[] = [
  ...fetchSubscriptionSteps,
  ...locationSteps,
];
