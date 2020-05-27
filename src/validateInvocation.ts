import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk';

import { default as authenticateGraph } from './azure/graph/authenticate';
import { default as authenticateResourceManager } from './azure/resource-manager/authenticate';
import { IntegrationConfig } from './types';

export default async function validateInvocation(
  validationContext: IntegrationExecutionContext<IntegrationConfig>,
): Promise<void> {
  const config = validationContext.instance.config;

  if (!config.clientId || !config.clientSecret || !config.directoryId) {
    throw new IntegrationValidationError(
      'Integration configuration requires all of {clentId, clientSecret, directoryId}',
    );
  }

  try {
    await authenticateGraph(config);
    if (config.subscriptionId) {
      await authenticateResourceManager(config);
    }
  } catch (err) {
    // TODO Use IntegrationProviderAuthenticationError
    throw new IntegrationValidationError(err);
  }
}
