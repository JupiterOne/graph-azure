import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { SecurityClient } from './client';
import { IntegrationConfig } from '../../../types';
import {
  Pricing,
  SecurityAssessment,
  SecurityContact,
} from '@azure/arm-security/esm/models';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { v4 as uuid } from 'uuid';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterate assessments', () => {
  test('all', async () => {
    // developer used different creds than ~/test/integrationInstanceConfig
    const config: IntegrationConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
      subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
    };

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

describe('iterate security contacts', () => {
  test('all', async () => {
    // developer used different creds than ~/test/integrationInstanceConfig
    const config: IntegrationConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateSecurityContacts',
    });

    const client = new SecurityClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: SecurityContact[] = [];

    await client.iterateSecurityContacts((e) => {
      resources.push(e);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        alertNotifications: 'On',
        alertsToAdmins: 'On',
        email: 'test@j1dev.com',
        etag: '"0d004bb2-0000-0d00-0000-5fa1dd9c0000"',
        id: `/subscriptions/${config.subscriptionId}/providers/Microsoft.Security/securityContact/default1`,
        location: 'West Europe',
        name: 'default1',
        phone: '+1-801-555-1234',
        type: 'Microsoft.Security/securityContact',
      }),
    );
  });
});

describe('iteratePricings', () => {
  function getConfigForTest(config: IntegrationConfig): IntegrationConfig {
    // The Azure Subscription Client has some validation before sending requests to
    // this endpoint that requires "subscriptionId" to be a UUID.
    //
    // When running tests in CI, we set the value of `config.subscriptionId` to "subscriptionId",
    // causing the Azure SDK to throw the following:
    //
    // "subscriptionId" with value "subscriptionId" should satisfy the constraint
    // "Pattern": /^[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}$/.

    const subscriptionIdValidationRegex = /^[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}$/;
    return {
      ...config,
      subscriptionId: subscriptionIdValidationRegex.test(
        config.subscriptionId || '',
      )
        ? config.subscriptionId
        : uuid(),
    };
  }
  test('success', async () => {
    const config = getConfigForTest(configFromEnv);

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iteratePricings',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config }),
      },
    });

    const client = new SecurityClient(config, createMockIntegrationLogger());

    const pricings: Pricing[] = [];
    await client.iteratePricings((pricing) => {
      pricings.push(pricing);
    });

    expect(pricings.length).toBeGreaterThan(0);
  });
});
