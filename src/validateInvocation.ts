import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  IntegrationProviderAuthorizationError,
} from '@jupiterone/integration-sdk-core';

import { DirectoryGraphClient } from './steps/active-directory/client';
import { J1SubscriptionClient } from './steps/resource-manager/subscriptions/client';
import { IntegrationConfig } from './types';
import { hasSubscriptionId } from './utils/hasSubscriptionId';

export default async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
): Promise<void> {
  const config = context.instance.config;

  if (!config.clientId || !config.clientSecret || !config.directoryId) {
    throw new IntegrationValidationError(
      'Integration configuration requires all of {clentId, clientSecret, directoryId}',
    );
  }

  const directoryClient = new DirectoryGraphClient(context.logger, config);
  await directoryClient.validate();

  if (config.ingestActiveDirectory) {
    // await directoryClient.validateDirectoryPermissions();
  }

  if (hasSubscriptionId(config)) {
    const subscriptionClient = new J1SubscriptionClient(config, context.logger);
    try {
      await subscriptionClient.getSubscription(config.subscriptionId!);
    } catch (e) {
      throw new IntegrationProviderAuthorizationError({
        cause: e,
        status: e.statusCode,
        statusText: `${e.statusText}. ${e.body.message}`,
        endpoint: e.request.url,
      });
    }
  }
}
