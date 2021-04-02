import { getResourceGroupId, getSubscriptionId } from './matchers';

describe('getSubscriptionId', () => {
  test('should return undefined if azureResourceId=undefined', () => {
    expect(getSubscriptionId(undefined)).toBeUndefined();
  });

  test('should return undefined if !contains subscriptionId', () => {
    expect(getSubscriptionId('not-contains-subscription-id')).toBeUndefined();
  });

  test('should return subscriptionId if contains subscriptionId, case-sensitive', () => {
    expect(
      getSubscriptionId('/subscriptions/subscription-id/resourceGroups/rg-id'),
    ).toBe('/subscriptions/subscription-id');
  });

  test('should return subscriptionId if contains subscriptionId, case-insensitive', () => {
    expect(
      getSubscriptionId('/SUBSCRIPTIONS/SUBSCRIPTION-ID/RESOURCEGROUPS/RG-ID'),
    ).toBe('/SUBSCRIPTIONS/SUBSCRIPTION-ID');
  });
});

describe('getResourceGroupId', () => {
  test('should return undefined if !contains resourceGroupId', () => {
    expect(getResourceGroupId('not-contains-rg-id')).toBeUndefined();
  });

  test('should return subscriptionId if contains resourceGroupId, case-sensitive', () => {
    expect(
      getResourceGroupId(
        '/subscriptions/subscription-id/resourceGroups/rg-id/providers/Microsoft.Storage/storageAccount/sa-id',
      ),
    ).toBe('/subscriptions/subscription-id/resourceGroups/rg-id');
  });

  test('should return subscriptionId if contains resourceGroupId, case-insensitive', () => {
    expect(
      getResourceGroupId(
        '/SUBSCRIPTIONS/SUBSCRIPTION-ID/RESOURCEGROUPS/RG-ID/PROVIDERS/MICROSOFT.STORAGE/STORAGEACCOUNT/SA-ID',
      ),
    ).toBe('/SUBSCRIPTIONS/SUBSCRIPTION-ID/RESOURCEGROUPS/RG-ID');
  });
});
