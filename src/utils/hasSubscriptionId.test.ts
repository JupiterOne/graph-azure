import { hasSubscriptionId } from './hasSubscriptionId';
import { IntegrationConfig } from '../types';

test('should return true when subscriptionId is non-empty string', () => {
  expect(
    hasSubscriptionId({ subscriptionId: 'abcd' } as IntegrationConfig),
  ).toBe(true);
});

test('should return false when subscriptionId is empty string', () => {
  expect(hasSubscriptionId({ subscriptionId: '' } as IntegrationConfig)).toBe(
    false,
  );
});

test('should return false when subscriptionId is undefined', () => {
  expect(
    hasSubscriptionId({ subscriptionId: undefined } as IntegrationConfig),
  ).toBe(false);
});

test('should return false when subscriptionId is null', () => {
  expect(hasSubscriptionId({ subscriptionId: null } as IntegrationConfig)).toBe(
    false,
  );
});

test('should return false when subscriptionId is not present', () => {
  expect(hasSubscriptionId({} as IntegrationConfig)).toBe(false);
});
