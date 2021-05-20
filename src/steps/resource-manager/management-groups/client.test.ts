import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { ManagementGroupClient } from './client';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('getManagementGroup', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'getManagementGroup',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new ManagementGroupClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    /**
     * The default management group for a tenant ("Tenant Root Group") shares the same ID as the tenant/directory ID.
     */
    const managementGroup = await client.getManagementGroup(
      configFromEnv.directoryId,
    );
    expect(managementGroup.children?.length).toBeGreaterThan(0);
  });
});
