import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';

it('should reject', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {} as IntegrationConfig,
  });

  try {
    await validateInvocation(executionContext);
  } catch (e) {
    expect(e instanceof IntegrationValidationError).toBe(true);
  }
});

it('auth error', async () => {
  const executionContext = createMockExecutionContext({
    instanceConfig: {
      clientId: 'INVALID',
      clientSecret: 'INVALID',
      directoryId: 'INVALID',
    },
  });

  const exec = async () => {
    await validateInvocation(executionContext);
  };

  await expect(exec).rejects.toThrow(
    "Provider API failed at https://login.microsoftonline.com/INVALID/oauth2/v2.0/token: invalid_request AADSTS90002: Tenant 'invalid' not found. This may happen if there are no active subscriptions for the tenant. Check to make sure you have the correct tenant ID. Check with your subscription administrator.",
  );
});
