import { fetchContainerRegistries, fetchContainerRegistryWebhooks } from '.';
import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { ContainerRegistryEntities } from './constants';

let recording: Recording;
let instanceConfig: IntegrationConfig;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

describe('step - container registries', () => {
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
      name: 'resource-manager-step-container-registries',
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

    await fetchContainerRegistries(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Container Registry entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev`,
        _class: ContainerRegistryEntities.REGISTRY._class,
        _type: ContainerRegistryEntities.REGISTRY._type,
        adminUserEnabled: false,
        classification: null,
        dataEndpointEnabled: false,
        displayName: `${instanceConfig.developerId}j1dev`,
        encrypted: false,
        location: 'eastus',
        loginServer: `${instanceConfig.developerId}j1dev.azurecr.io`,
        name: `${instanceConfig.developerId}j1dev`,
        provisioningState: 'Succeeded',
        publicNetworkAccess: 'Enabled',
        type: 'Microsoft.ContainerRegistry/registries',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev`,
      }),
    );
  });

  it('should collect an Azure Resource Group has Azure Container Registry relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev`,
        _type: 'azure_resource_group_has_container_registry',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev`,
        displayName: 'HAS',
      }),
    );
  });
});

describe('step - container registry webhooks', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
      subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
      developerId: 'ndowmon1',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-container-registry-webhooks',
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev`,
          _type: 'azure_container_registry',
          _class: ['DataStore'],
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev`,
          name: 'ndowmon1j1dev',
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchContainerRegistryWebhooks(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Container Registry Webhook entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev/webhooks/j1dev`,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev/webhooks/j1dev`,
        _class: ContainerRegistryEntities.WEBHOOK._class,
        _type: ContainerRegistryEntities.WEBHOOK._type,
        actions: ['push'],
        active: true,
        address: 'NOT_RETURNED_FROM_AZURE_API',
        displayName: 'j1dev',
        location: 'eastus',
        name: 'j1dev',
        provisioningState: 'Succeeded',
        scope: '',
        status: 'enabled',
        type: 'Microsoft.ContainerRegistry/registries/webhooks',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev/webhooks/j1dev`,
      }),
    );
  });

  it('should collect an Azure Container Registry has Azure Container Registry Webhook relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev/webhooks/j1dev`,
        _type: 'azure_container_registry_has_webhook',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/${instanceConfig.developerId}j1dev/webhooks/j1dev`,
        displayName: 'HAS',
      }),
    );
  });
});
