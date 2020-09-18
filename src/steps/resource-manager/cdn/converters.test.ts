import { createAzureWebLinker } from '../../../azure';
import { createCdnProfileEntity, createCdnEndpointEntity } from './converters';
import { Profile, Endpoint } from '@azure/arm-cdn/esm/models';
import { CdnEntities } from './constants';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createContainerRegistryEntity', () => {
  test('properties transferred', () => {
    const data: Profile = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev',
      name: 'j1dev',
      type: 'Microsoft.Cdn/profiles',
      location: 'EastUs',
      tags: {},
      sku: { name: 'Standard_Microsoft' },
      resourceState: 'Active',
      provisioningState: 'Succeeded',
    };

    expect(createCdnProfileEntity(webLinker, data)).toMatchSnapshot();
    expect(createCdnProfileEntity(webLinker, data)).toMatchGraphObjectSchema({
      _class: CdnEntities.PROFILE._class,
      schema: {},
    });
  });
});

describe('createContainerRegistryWebhookEntity', () => {
  test('properties transferred', () => {
    // the following is returned from the API, but current SDK version doesn't recognize `systemData` as a property on `Webhook`
    const data: Endpoint = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/Microsoft.Cdn/profiles/j1dev/endpoints/j1dev',
      name: 'j1dev',
      type: 'Microsoft.Cdn/profiles/endpoints',
      location: 'EastUs',
      tags: {},
      originPath: undefined,
      contentTypesToCompress: [],
      originHostHeader: 'www.jupiterone.com',
      isCompressionEnabled: false,
      isHttpAllowed: true,
      isHttpsAllowed: true,
      queryStringCachingBehavior: 'IgnoreQueryString',
      optimizationType: undefined,
      probePath: undefined,
      geoFilters: [],
      defaultOriginGroup: undefined,
      urlSigningKeys: [],
      deliveryPolicy: { description: '', rules: [] },
      webApplicationFirewallPolicyLink: undefined,
      hostName: 'j1dev.azureedge.net',
      origins: [
        {
          name: 'j1dev',
          hostName: 'www.jupiterone.com',
          httpPort: 80,
          httpsPort: 443,
          originHostHeader: 'www.jupiterone.com',
          priority: 1,
          weight: 1000,
          enabled: true,
          privateLinkAlias: undefined,
          privateLinkResourceId: undefined,
          privateLinkLocation: undefined,
          privateLinkApprovalMessage: undefined,
        },
      ],
      originGroups: [],
      resourceState: 'Running',
      provisioningState: 'Succeeded',
    };

    expect(createCdnEndpointEntity(webLinker, data)).toMatchSnapshot();
    expect(createCdnEndpointEntity(webLinker, data)).toMatchGraphObjectSchema({
      _class: CdnEntities.ENDPOINT._class,
      schema: {},
    });
  });
});
