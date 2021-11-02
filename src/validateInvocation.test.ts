import {
  IntegrationValidationError,
  shouldReportErrorToOperator,
} from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';

import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../test/helpers/recording';
import { configFromEnv } from '../test/integrationInstanceConfig';

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

  await expect(exec).rejects.toThrow(/AADSTS90002: Tenant 'invalid' not found[a-zA-Z]*/);
});

describe('validateInvocation recordings', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  test('validates with subscriptionId', async () => {
    const config = {
      ...configFromEnv,
      subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
    };
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithValidSubscriptionId',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config }),
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: config,
    });

    await expect(validateInvocation(executionContext)).resolves.toBeUndefined();
  });

  test('validates with empty subscriptionId', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithEmptySubscriptionId',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...configFromEnv,
        subscriptionId: '',
      },
    });

    await expect(validateInvocation(executionContext)).resolves.toBeUndefined();
  });

  test('validates with undefined subscriptionId', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithUndefinedSubscriptionId',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...configFromEnv,
        subscriptionId: undefined,
      },
    });

    await expect(validateInvocation(executionContext)).resolves.toBeUndefined();
  });

  test('validates with null subscriptionId', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithNullSubscriptionId',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...configFromEnv,
        subscriptionId: null,
      },
    });

    await expect(validateInvocation(executionContext)).resolves.toBeUndefined();
  });

  test('throws when directory ID is invalid', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithInvalidDirectoryId',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        recordFailedRequests: true,
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...configFromEnv,
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

  test('throws when subscription ID is malformed or invalid', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithInvalidSubscriptionId',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        recordFailedRequests: true,
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...configFromEnv,
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
      `The provided subscription identifier 'some-fake-subscription-id' is malformed or invalid.`,
    );
    expect(shouldReportErrorToOperator(err)).toBe(false);
  });

  test('throws when subscription ID is not found', async () => {
    const configWithNoAccessToSubscription = {
      ...configFromEnv,
      subscriptionId: '00000000-0000-0000-0000-000000000000',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithNotFoundSubscriptionId',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: configWithNoAccessToSubscription,
        }),
        recordFailedRequests: true,
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: configWithNoAccessToSubscription,
    });

    let err: any;
    try {
      await validateInvocation(executionContext);
    } catch (e) {
      err = e;
    }
    expect(err).not.toBeUndefined();
    expect(err.message).toMatch(
      `The subscription '00000000-0000-0000-0000-000000000000' could not be found.`,
    );
    expect(shouldReportErrorToOperator(err)).toBe(false);
  });

  test('throws when client is not granted Reader access to subscription ID', async () => {
    const configWithNoAccessToSubscription = {
      ...configFromEnv,
      subscriptionId: 'df44baaf-f737-48d5-ab23-020a20fa94da',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithNoAccessToSubscriptionId',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: configWithNoAccessToSubscription,
        }),
        recordFailedRequests: true,
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: configWithNoAccessToSubscription,
    });

    let err: any;
    try {
      await validateInvocation(executionContext);
    } catch (e) {
      err = e;
    }
    expect(err).not.toBeUndefined();
    expect(err.message).toMatch(
      `The client 'ae2e9f26-7e05-41df-89ab-ba958f2bf8cd' with object id 'ae2e9f26-7e05-41df-89ab-ba958f2bf8cd' does not have authorization to perform action 'Microsoft.Resources/subscriptions/read' over scope '/subscriptions/df44baaf-f737-48d5-ab23-020a20fa94da' or the scope is invalid. If access was recently granted, please refresh your credentials.`,
    );
    expect(shouldReportErrorToOperator(err)).toBe(false);
  });

  test('throws when tenant ID has invalid input', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateInvocationWithInvalidInputInDirectoryId',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        recordFailedRequests: true,
      },
    });

    const executionContext = createMockExecutionContext({
      instanceConfig: {
        ...configFromEnv,
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
