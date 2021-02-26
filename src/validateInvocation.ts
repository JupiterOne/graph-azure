import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';

import { default as authenticateGraph } from './azure/graph/authenticate';
import { validateResourceManagerInvocation } from './azure/resource-manager/authenticate';
import { IntegrationConfig } from './types';
import { hasSubscriptionId } from './utils/hasSubscriptionId';

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
  } catch (err) {
    if (!(err instanceof IntegrationError)) {
      throw new IntegrationValidationError(err);
    } else {
      throw err;
    }
  }

  if (hasSubscriptionId(config)) {
    try {
      await validateResourceManagerInvocation(config);
    } catch (err) {
      if (!(err instanceof IntegrationError)) {
        throw new IntegrationValidationError(err);
      } else {
        throw err;
      }
    }
  }
}
