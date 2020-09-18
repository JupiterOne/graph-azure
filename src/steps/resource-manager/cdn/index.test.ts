import { fetchProfiles, fetchEndpoints } from '.';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { CdnEntities } from './constants';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - cdn profiles', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-cdn-profiles',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
      },
    ],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchProfiles(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: CdnEntities.PROFILE._class,
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev',
      _type: 'azure_resource_group_has_cdn_profile',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev',
      displayName: 'HAS',
    },
  ]);
});

test('step - cdn endpoints', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-cdn-endpoints',
  });

  const parentId =
    '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev';
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _key: parentId,
        _type: CdnEntities.PROFILE._type,
        _class: CdnEntities.PROFILE._class,
        id: parentId,
        name: 'j1dev',
      },
    ],
  });

  context.jobState.getData = jest.fn().mockResolvedValue({
    defaultDomain: 'www.fake-domain.com',
  });

  await fetchEndpoints(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: CdnEntities.ENDPOINT._class,
    schema: {},
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev|has|/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev',
      _type: 'azure_cdn_profile_has_endpoint',
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev',
      _toEntityKey:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev',
      displayName: 'HAS',
    },
  ]);
});
