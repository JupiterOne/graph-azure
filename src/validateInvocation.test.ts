import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';

import * as graphAuthenticate from './azure/graph/authenticate';

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

test('rejects when ingestResourceManager=true and subscriptionId=undefined', async () => {
  jest
    .spyOn(graphAuthenticate, 'default')
    .mockResolvedValueOnce('someAccessToken');
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {
      clientId: 'INVALID',
      clientSecret: 'INVALID',
      directoryId: 'INVALID',
      ingestResourceManager: true,
    } as IntegrationConfig,
  });

  const exec = async () => validateInvocation(executionContext);
  await expect(exec).rejects.toThrow(
    'When integration configuration value ingestResourceManager flag is set to true, subscriptionId is required.',
  );
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
