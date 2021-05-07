import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { AppServiceClient } from './client';
import { Site } from '@azure/arm-appservice/esm/models';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateApps', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateApps',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new AppServiceClient(
      configFromEnv,
      createMockIntegrationLogger(),
      true,
    );

    const resources: Site[] = [];
    await client.iterateApps((e) => {
      resources.push(e);
    });

    expect(resources.length).toBeGreaterThan(0);
  });
});

describe('iterateAppServicePlans', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateAppServicePlans',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new AppServiceClient(
      configFromEnv,
      createMockIntegrationLogger(),
      true,
    );

    const resources: Site[] = [];
    await client.iterateAppServicePlans((e) => {
      resources.push(e);
    });

    expect(resources.length).toBeGreaterThan(0);
  });
});
