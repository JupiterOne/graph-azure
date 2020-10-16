import { createAzureWebLinker } from '../../../azure';
import {
  createContainerRegistryEntity,
  createContainerRegistryWebhookEntity,
} from './converters';
import { Registry, Webhook } from '@azure/arm-containerregistry/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createContainerRegistryEntity', () => {
  test('properties transferred', () => {
    const data: Registry & { systemData: any } = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/ndowmon1j1dev',
      name: 'ndowmon1j1dev',
      type: 'Microsoft.ContainerRegistry/registries',
      location: 'eastus',
      tags: {},
      sku: { name: 'Basic', tier: 'Basic' },
      loginServer: 'ndowmon1j1dev.azurecr.io',
      creationDate: new Date('2020-09-09T23:49:02.733Z'),
      provisioningState: 'Succeeded',
      adminUserEnabled: false,
      policies: {
        quarantinePolicy: { status: 'disabled' },
        trustPolicy: { type: 'Notary', status: 'disabled' },
        retentionPolicy: {
          days: 7,
          lastUpdatedTime: new Date('2020-09-09T23:49:04.060Z'),
          status: 'disabled',
        },
      },
      encryption: { status: 'disabled' },
      dataEndpointEnabled: false,
      dataEndpointHostNames: [],
      privateEndpointConnections: [],
      publicNetworkAccess: 'Enabled',
      systemData: {
        createdBy: 'd2c4cc5a-4ace-480c-aeff-2c97326511ba',
        createdByType: 'Application',
        createdAt: '2020-09-09T23:49:02.73313+00:00',
        lastModifiedBy: 'd2c4cc5a-4ace-480c-aeff-2c97326511ba',
        lastModifiedByType: 'Application',
        lastModifiedAt: '2020-09-09T23:49:02.73313+00:00',
      },
    };

    expect(createContainerRegistryEntity(webLinker, data)).toMatchSnapshot();
    expect(
      createContainerRegistryEntity(webLinker, data),
    ).toMatchGraphObjectSchema({
      _class: ['DataStore'],
    });
  });
});

describe('createContainerRegistryWebhookEntity', () => {
  test('properties transferred', () => {
    // the following is returned from the API, but current SDK version doesn't recognize `systemData` as a property on `Webhook`
    const data: Webhook & { systemData: any } = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/j1dev/providers/Microsoft.ContainerRegistry/registries/ndowmon1j1dev/webhooks/j1dev',
      name: 'j1dev',
      type: 'Microsoft.ContainerRegistry/registries/webhooks',
      location: 'eastus',
      tags: {},
      status: 'enabled',
      scope: '',
      actions: ['push'],
      provisioningState: 'Succeeded',
      systemData: {
        createdBy: 'd2c4cc5a-4ace-480c-aeff-2c97326511ba',
        createdByType: 'Application',
        createdAt: '2020-09-09T23:49:06.7238034+00:00',
        lastModifiedBy: 'd2c4cc5a-4ace-480c-aeff-2c97326511ba',
        lastModifiedByType: 'Application',
        lastModifiedAt: '2020-09-09T23:49:06.7238034+00:00',
      },
    };

    expect(
      createContainerRegistryWebhookEntity(webLinker, data),
    ).toMatchSnapshot();
    expect(
      createContainerRegistryWebhookEntity(webLinker, data),
    ).toMatchGraphObjectSchema({
      _class: ['ApplicationEndpoint'],
    });
  });
});
