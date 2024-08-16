import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import { User } from '@microsoft/microsoft-graph-types';

import config, { configFromEnv } from '../../../test/integrationInstanceConfig';
import { DirectoryGraphClient } from './client';
import {
  Recording,
  azureMutations,
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../test/helpers/recording';
import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

const logger = createMockIntegrationLogger();

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

/**
 * The /policy/fetchIdentitySecurityDefaultsEnforcementPolicy endpoint returns data to inform
 * users whether their default directory has enabled `Security Defaults`.
 *
 * Although any user can access this switch in the portal.azure.com UI, apparently it is only functional for
 * "Delegated (work or school account)" or "Application" callers. It is _not supported_ for "Delegated
 * (personal Microsoft account)", according to the documentation:
 *
 * https://docs.microsoft.com/en-us/graph/api/identitysecuritydefaultsenforcementpolicy-get?view=graph-rest-1.0&tabs=http
 *
 * It also requires an additional permission, Policy.Read.All.
 */
describe('fetchIdentitySecurityDefaultsEnforcementPolicy', () => {
  // When re-recording this test, ensure it is recorded using a service principal with Policy.Read.All
  test('should fetch for account with permission Policy.Read.All', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'fetchIdentitySecurityDefaultsEnforcementPolicy-with-permission',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
      mutateEntry: (entry) => {
        azureMutations.unzipGzippedRecordingEntry(entry);
        azureMutations.mutateAccessToken(entry, (accessToken) =>
          ['[REDACTED]', accessToken.split('.')[1], '[REDACTED]'].join('.'),
        );
      },
    });

    const client = new DirectoryGraphClient(logger as IntegrationLogger, configFromEnv);
    const response =
      await client.fetchIdentitySecurityDefaultsEnforcementPolicy();

    expect(response).toMatchObject({
      isEnabled: expect.any(Boolean),
    });
  });

  // When re-recording this test, ensure it is recorded using a service principal without Policy.Read.All
  test('should inform user if not granted permission Policy.Read.All', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'fetchIdentitySecurityDefaultsEnforcementPolicy-without-permission',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
      mutateEntry: (entry) => {
        azureMutations.unzipGzippedRecordingEntry(entry);
        azureMutations.mutateAccessToken(entry, (accessToken) =>
          ['[REDACTED]', accessToken.split('.')[1], '[REDACTED]'].join('.'),
        );
      },
    });
    const publishEventSpy = jest.spyOn(logger, 'publishEvent');

    const client = new DirectoryGraphClient(logger as IntegrationLogger, configFromEnv);
    const response =
      await client.fetchIdentitySecurityDefaultsEnforcementPolicy();

    expect(response).toBeUndefined();
    expect(publishEventSpy).toHaveBeenCalledTimes(1);
    expect(publishEventSpy).toHaveBeenCalledWith({
      name: 'warn_missing_permission',
      level: 'warn',
      description:
        'Unable to fetch data from /policies/identitySecurityDefaultsEnforcementPolicy. See https://github.com/JupiterOne/graph-azure/blob/master/docs/jupiterone.md#permissions for more information about optional permissions for this integration.',
    });
    publishEventSpy.mockRestore();
  });
});

describe('iterateUsers', () => {
  test('404 answers empty collection', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateUsers404',
    });

    const client = new DirectoryGraphClient(logger as IntegrationLogger, config);

    recording.server
      .get('https://graph.microsoft.com/v1.0/users')
      .intercept((req, res) => {
        res.status(404);
      });

    const resources: User[] = [];
    await client.iterateUsers((e) => {
      resources.push(e);
    });

    expect(resources.length).toEqual(0);
  });
});
