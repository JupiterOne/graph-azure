import { IntegrationConfig } from '../types';

export function hasSubscriptionId(config: IntegrationConfig): boolean {
  return (
    config.subscriptionId?.length !== undefined &&
    config.subscriptionId.length > 0
  );
}
