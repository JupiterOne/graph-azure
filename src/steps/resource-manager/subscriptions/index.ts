import { AzureIntegrationStep } from '../../../types';
import { locationSteps } from './executionHandlers/locations';
import { subscriptionDiagnosticSettingSteps } from './executionHandlers/subscriptionDiagnosticSettings';
import { fetchSubscriptionSteps } from './executionHandlers/subscriptions';

export const subscriptionSteps: AzureIntegrationStep[] = [
  ...fetchSubscriptionSteps,
  ...locationSteps,
  ...subscriptionDiagnosticSettingSteps,
];
