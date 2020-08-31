import { convertProperties } from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { createSubscriptionEntity } from './converters';
import { Subscription } from '@azure/arm-subscriptions/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createSubscriptionEntity', () => {
  test('properties transferred', () => {
    const data: Subscription = {
      id: '/subscriptions/subscription-id',
      authorizationSource: 'RoleBased',
      subscriptionId: 'subscription-id',
      displayName: 'j1dev-subscription',
      state: 'Enabled',
      subscriptionPolicies: {
        locationPlacementId: 'Public_2014-09-01',
        quotaId: 'FreeTrial_2014-09-01',
        spendingLimit: 'On',
      },
    };

    expect(createSubscriptionEntity(webLinker, data)).toEqual({
      ...convertProperties(data),
      _key: '/subscriptions/subscription-id',
      _type: 'azure_subscription',
      _class: ['Account'],
      _rawData: [{ name: 'default', rawData: data }],
      id: '/subscriptions/subscription-id',
      name: 'j1dev-subscription',
      displayName: 'j1dev-subscription',
      createdOn: undefined,
      webLink: webLinker.portalResourceUrl('/subscriptions/subscription-id'),
    });
  });
});
