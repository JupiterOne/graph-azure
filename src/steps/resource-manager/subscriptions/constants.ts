import { StepEntityMetadata } from '@jupiterone/integration-sdk-core';

// Fetch Resource Groups
export const STEP_RM_SUBSCRIPTIONS = 'rm-subscriptions';

export const SUBSCRIPTION_ENTITY_METADATA: StepEntityMetadata = {
  _type: 'azure_subscription',
  _class: ['Account'],
  resourceName: '[RM] Subscription',
};
