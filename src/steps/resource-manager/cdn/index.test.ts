import { fetchProfiles, fetchEndpoints } from '.';
import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { CdnEntities } from './constants';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';

let recording: Recording;
let instanceConfig: IntegrationConfig;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

describe('step - cdn profiles', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-cdn-profiles',
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _type: 'azure_resource_group',
          _class: ['Group'],
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchProfiles(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure CDN Profile entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: CdnEntities.PROFILE._class,
        _type: CdnEntities.PROFILE._type,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
        displayName: 'j1dev',
        kind: 'cdn',
        location: 'EastUs',
        name: 'j1dev',
        provisioningState: 'Succeeded',
        resourceState: 'Active',
        type: 'Microsoft.Cdn/profiles',
      }),
    );
  });

  it('should collect an Azure Resource Group has Azure CDN Profile relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
      _type: 'azure_resource_group_has_cdn_profile',
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
      displayName: 'HAS',
    });
  });
});

describe('step - cdn endpoints', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-cdn-endpoints',
    });

    const parentId = `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`;

    context = createMockAzureStepExecutionContext({
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
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchEndpoints(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure CDN Endpoint entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
        _class: CdnEntities.ENDPOINT._class,
        _type: CdnEntities.ENDPOINT._type,
        category: ['data'],
        displayName: 'j1dev',
        function: ['content-distribution'],
        hostName: 'j1dev.azureedge.net',
        isCompressionEnabled: false,
        isHttpAllowed: true,
        isHttpsAllowed: true,
        location: 'EastUs',
        name: 'j1dev',
        originHostHeader: 'www.jupiterone.com',
        provisioningState: 'Succeeded',
        public: true,
        queryStringCachingBehavior: 'IgnoreQueryString',
        resourceState: 'Running',
        type: 'Microsoft.Cdn/profiles/endpoints',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
      }),
    );
  });

  it('should collect an Azure CDN Profile has an Azure CDN Endpoint relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
        _type: 'azure_cdn_profile_has_endpoint',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev`,
        displayName: 'HAS',
      }),
    );
  });
});
