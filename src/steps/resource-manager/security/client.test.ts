import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { SecurityClient } from './client';
import { IntegrationConfig } from '../../../types';
import { SecurityAssessment } from '@azure/arm-security/esm/models';

// developer used different creds than ~/test/integrationInstanceConfig
const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
  subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
};

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterate assessments', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateAssessments',
    });

    const client = new SecurityClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const subscriptionScope = `/subscriptions/${config.subscriptionId}`;

    const resources: SecurityAssessment[] = [];
    await client.iterateAssessments(subscriptionScope, (e) => {
      resources.push(e);
    });

    expect(resources.length).toBeGreaterThan(0);
    expect(resources).toContainEqual(
      expect.objectContaining({
        type: 'Microsoft.Security/assessments',
      }),
    );
  });
});
