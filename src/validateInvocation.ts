import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  IntegrationError,
  IntegrationLocalConfigFieldMissingError,
} from '@jupiterone/integration-sdk-core';

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
  } catch (err) {
    if (!(err instanceof IntegrationError)) {
      throw new IntegrationValidationError(err);
    } else {
      throw err;
    }
  }

  if (config.ingestResourceManager) {
    if (!config.subscriptionId) {
      throw new IntegrationLocalConfigFieldMissingError(
        'When integration configuration value ingestResourceManager flag is set to true, subscriptionId is required.',
      );
    }

    try {
      await authenticateResourceManager(config);
    } catch (err) {
      if (!(err instanceof IntegrationError)) {
        throw new IntegrationValidationError(err);
      } else {
        throw err;
      }
    }
  }
}
