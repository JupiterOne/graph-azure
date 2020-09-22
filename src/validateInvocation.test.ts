import {
  IntegrationValidationError,
  shouldReportErrorToOperator,
} from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';

import { Recording, setupAzureRecording } from '../test/helpers/recording';

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
    "AADSTS90002: Tenant 'invalid' not found. This may happen if there are no active subscriptions for the tenant. Check to make sure you have the correct tenant ID. Check with your subscription administrator.",
  );
});

describe('validateInvocation recordings', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  const config: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  test('validates with subscriptionId', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithValidSubscriptionId',
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: config,
    });

    const response = await validateInvocation(executionContext);

    expect(response).toBe(undefined);
  });

  test('validates with empty subscriptionId', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithEmptySubscriptionId',
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...config,
        subscriptionId: '',
      },
    });

    const response = await validateInvocation(executionContext);

    expect(response).toBe(undefined);
  });

  test('validates with undefined subscriptionId', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithUndefinedSubscriptionId',
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...config,
        subscriptionId: undefined,
      },
    });

    const response = await validateInvocation(executionContext);

    expect(response).toBe(undefined);
  });

  test('throws when directory ID is invalid', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithInvalidDirectoryId',
      options: {
        recordFailedRequests: true,
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...config,
        directoryId: 'some-fake-directory-id',
      },
    });

    let err: any;
    try {
      await validateInvocation(executionContext);
    } catch (e) {
      err = e;
    }
    expect(err).not.toBeUndefined();
    expect(err.message).toMatch(
      "AADSTS90002: Tenant 'some-fake-directory-id' not found. This may happen if there are no active subscriptions for the tenant. Check to make sure you have the correct tenant ID. Check with your subscription administrator.",
    );
    expect(shouldReportErrorToOperator(err)).toBe(false);
  });

  test('throws when subscription ID is invalid', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithInvalidSubscriptionId',
      options: {
        recordFailedRequests: true,
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...config,
        subscriptionId: 'some-fake-subscription-id',
      },
    });

    let err: any;
    try {
      await validateInvocation(executionContext);
    } catch (e) {
      err = e;
    }
    expect(err).not.toBeUndefined();
    expect(err.message).toMatch(
      'subscriptionId not found in tenant specified by directoryId',
    );
    expect(shouldReportErrorToOperator(err)).toBe(false);
  });

  test('throws when tenant ID has invalid input', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithInvalidInputInDirectoryId',
      options: {
        recordFailedRequests: true,
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...config,
        directoryId:
          '%22%3E%3Cscript%20src=https://hgxxss.xss.ht%3E%3C/script%3E',
      },
    });

    let err: any;
    try {
      await validateInvocation(executionContext);
    } catch (e) {
      err = e;
    }
    expect(err).not.toBeUndefined();
    expect(err.message).toMatch(
      'AADSTS90013: Invalid input received from the user. The provided directory ID is invalid.',
    );
    expect(shouldReportErrorToOperator(err)).toBe(false);
  });
});
