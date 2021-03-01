// import Persister from '@pollyjs/persister';
import { setupAzureRecording, getMatchRequestsBy } from './recording';
import { IntegrationConfig } from '../../src/types';

import { J1SubscriptionClient } from '../../src/steps/resource-manager/subscriptions/client';
import {
  createMockExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { DirectoryGraphClient } from '../../src/steps/active-directory/client';
import { configFromEnv } from '../integrationInstanceConfig';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { User } from '@microsoft/microsoft-graph-types';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

function setupMatchRequestRecording(name: string, config: IntegrationConfig) {
  return setupAzureRecording({
    directory: __dirname,
    name,
    options: {
      matchRequestsBy: getMatchRequestsBy({ config }),
    },
  });
}

const mockInstanceConfig: IntegrationConfig = {
  directoryId: 'directoryId',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  subscriptionId: 'subscriptionId',
};

test('should not re-record azure resource-manager API calls', async () => {
  const recordingName = 'matchRequestsBy-resource-manager';
  // Record using valid credentials for IntegrationConfig
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: configFromEnv,
  });
  recording = setupMatchRequestRecording(
    recordingName,
    executionContext.instance.config,
  );

  const client = new J1SubscriptionClient(
    executionContext.instance.config,
    executionContext.logger,
  );
  const clientSubscriptions: Subscription[] = [];
  await client.iterateSubscriptions((subscription) => {
    clientSubscriptions.push(subscription);
  });
  await recording.stop();

  // Now setup recording using `mockInstanceConfig`. Even with different arguments,
  // the tests should pass if the recording matches.
  recording = setupMatchRequestRecording(recordingName, mockInstanceConfig);

  const badClient = new J1SubscriptionClient(
    mockInstanceConfig,
    executionContext.logger,
  );
  const badClientSubscriptions: Subscription[] = [];
  await badClient.iterateSubscriptions((subscription) => {
    badClientSubscriptions.push(subscription);
  });
  await recording.stop();

  expect(clientSubscriptions).toEqual(badClientSubscriptions);
});

test('should not re-record azure graph API calls', async () => {
  const recordingName = 'matchRequestsBy-graph';
  // Record using valid credentials for IntegrationConfig
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: configFromEnv,
  });
  recording = setupMatchRequestRecording(
    recordingName,
    executionContext.instance.config,
  );

  const graphClient = new DirectoryGraphClient(
    executionContext.logger,
    executionContext.instance.config,
  );
  const graphClientUsers: User[] = [];
  await graphClient.iterateUsers((user) => {
    graphClientUsers.push(user);
  });
  await recording.stop();

  // Now setup recording using `mockInstanceConfig`. Even with different arguments,
  // the tests should pass if the recording matches.
  recording = setupMatchRequestRecording(recordingName, mockInstanceConfig);

  const badGraphClient = new DirectoryGraphClient(
    executionContext.logger,
    mockInstanceConfig,
  );
  const badGraphClientUsers: User[] = [];
  await badGraphClient.iterateUsers((user) => {
    badGraphClientUsers.push(user);
  });
  await recording.stop();

  expect(graphClientUsers).toEqual(badGraphClientUsers);
});
