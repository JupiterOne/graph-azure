import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  IntegrationProviderAuthorizationError,
  IntegrationProviderAPIError,
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
      const isInstanceOfProviderAPIError =
        e instanceof IntegrationProviderAPIError;
      const status = isInstanceOfProviderAPIError ? e.status : e.statusCode;
      const statusText = `${e.statusText}. ${
        isInstanceOfProviderAPIError ? e.message : e.body.message
      }`;
      const endpoint = isInstanceOfProviderAPIError
        ? e.endpoint
        : e.request.url;

      throw new IntegrationProviderAuthorizationError({
        cause: e,
        status: status,
        statusText,
        endpoint,
      });
    }
  }
}
