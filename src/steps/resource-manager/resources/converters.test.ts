import { convertProperties } from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import {
  createResourceGroupEntity,
  createResourceGroupLockEntitiy,
} from './converters';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import { ManagementLockModels } from '@azure/arm-locks';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createResourceGroupEntity', () => {
  test('properties transferred', () => {
    const data: ResourceGroup = {
      id: '/subscriptions/subscription-id/resourceGroups/j1dev',
      location: 'eastus',
      name: 'j1dev',
      properties: {
        provisioningState: 'Succeeded',
      },
      tags: {
        environment: 'j1dev',
      },
      type: 'Microsoft.Resources/resourceGroups',
    };

    expect(createResourceGroupEntity(webLinker, data)).toEqual({
      ...convertProperties(data),
      _key: '/subscriptions/subscription-id/resourceGroups/j1dev',
      _type: 'azure_resource_group',
      _class: ['Group'],
      _rawData: [{ name: 'default', rawData: data }],
      id: '/subscriptions/subscription-id/resourceGroups/j1dev',
      name: 'j1dev',
      displayName: 'j1dev',
      type: 'Microsoft.Resources/resourceGroups',
      createdOn: undefined,
      managedBy: undefined,
      provisioningState: 'Succeeded',
      location: 'eastus',
      'tag.environment': 'j1dev',
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/subscription-id/resourceGroups/j1dev',
      ),
    });
  });
});

describe('createResourceGroupLockEntity', () => {
  test('properties transferred', () => {
    const data: ManagementLockModels.ManagementLockObject = {
      id: '/subscriptions/subscription-id/resourceGroups/j1dev/locks/j1-lock',
      name: 'j1-lock',
      type: 'Microsoft.Authorization/locks',
      level: 'ReadOnly',
      notes: 'This is a test lock',
    };

    expect(createResourceGroupLockEntitiy(webLinker, data)).toEqual({
      ...convertProperties(data),
      createdOn: undefined,
      _key: '/subscriptions/subscription-id/resourceGroups/j1dev/locks/j1-lock',
      _type: 'azure_resource_group_resource_lock',
      _class: ['Rule'],
      _rawData: [{ name: 'default', rawData: data }],
      id: '/subscriptions/subscription-id/resourceGroups/j1dev/locks/j1-lock',
      name: 'j1-lock',
      displayName: 'j1-lock',
      type: 'Microsoft.Authorization/locks',
      level: 'ReadOnly',
      notes: 'This is a test lock',
      webLink: webLinker.portalResourceUrl(
        '/subscriptions/subscription-id/resourceGroups/j1dev/locks/j1-lock',
      ),
    });
  });
});
