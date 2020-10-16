import { fetchZones, fetchRecordSets } from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - dns zones', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-dns-zones',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchZones(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'DomainZone',
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com',
      _type: 'azure_resource_group_has_dns_zone',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/jupiterone-dev.com',
      displayName: 'HAS',
    },
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/mit-cyber.space',
      _type: 'azure_resource_group_has_dns_zone',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/mit-cyber.space',
      displayName: 'HAS',
    },
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/test.mit-cyber.space',
      _type: 'azure_resource_group_has_dns_zone',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.Network/dnszones/test.mit-cyber.space',
      displayName: 'HAS',
    },
  ]);
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
    _class: 'DomainRecord',
    schema: {},
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
