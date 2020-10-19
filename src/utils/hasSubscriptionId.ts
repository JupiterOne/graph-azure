import { IntegrationConfig } from '../types';

export function hasSubscriptionId(config: IntegrationConfig): boolean {
  const subscriptionId = config.subscriptionId;
  return subscriptionId !== undefined && subscriptionId.length > 0;
}
