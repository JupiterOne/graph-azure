import { fetchZones, fetchRecordSets } from '.';
import { Recording, RecordingEntry } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  azureMutations,
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { PrivateDnsEntities } from '../private-dns/constants';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('rm-dns-zones', () => {
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-dns-zones',
      mutateEntry: (entry: RecordingEntry) => {
        azureMutations.unzipGzippedRecordingEntry(entry);
        azureMutations.mutateAccessToken(entry, () => '[REDACTED]');
        if (
          entry.request.url.endsWith(
            '/providers/Microsoft.Network?api-version=2020-06-01',
          )
        ) {
          azureMutations.redactAllPropertiesExcept(entry, [
            'registrationState',
          ]);
        }
      },
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: getMockAccountEntity(configFromEnv),
      },
    });

    await fetchZones(context);

    expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: PrivateDnsEntities.ZONE._class,
    });
  }, 10_000);

  test('NotRegistered', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-dns-zone-NotRegistered',
      mutateEntry: (entry: RecordingEntry) => {
        azureMutations.unzipGzippedRecordingEntry(entry);
        azureMutations.mutateAccessToken(entry, () => '[REDACTED]');
        if (
          entry.request.url.endsWith(
            '/providers/Microsoft.Network?api-version=2020-06-01',
          )
        ) {
          azureMutations.redactAllPropertiesExcept(entry, [
            'registrationState',
          ]);
        }
      },
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: getMockAccountEntity(configFromEnv),
      },
    });

    const publishEventSpy = jest.spyOn(context.logger, 'publishEvent');

    await expect(fetchZones(context)).resolves.not.toThrow();
    expect(publishEventSpy).toHaveBeenCalledWith({
      name: 'UNREGISTERED_PROVIDER',
      description: `The subscription ${configFromEnv.subscriptionId} must have the "Microsoft.Network" Resource Provider registered in order to ingest DNS zones. The "Microsoft.Network" resource provider has a registration state of "NotRegistered".`,
    });
  }, 10_000);
});

test('step - dns record sets', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-dns-record-sets',
    options: {
      recordFailedRequests: true,
    },
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com',
        _type: 'azure_dns_zone',
        _class: ['DomainZone'],
        id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com',
        name: 'jupiterone-dev.com',
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchRecordSets(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: ['DomainRecord'],
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com/NS/@',
      _type: 'azure_dns_zone_has_record_set',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com/NS/@',
      displayName: 'HAS',
    },
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com/SOA/@',
      _type: 'azure_dns_zone_has_record_set',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com/SOA/@',
      displayName: 'HAS',
    },
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com/A/j1dev',
      _type: 'azure_dns_zone_has_record_set',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com/A/j1dev',
      displayName: 'HAS',
    },
  ]);
});
