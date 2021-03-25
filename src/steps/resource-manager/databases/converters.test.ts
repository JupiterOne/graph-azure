import { testFunctions } from './converters';

const { getConfiguration } = testFunctions;

describe('getConfiguration', () => {
  const configurations = [
    { name: 'log_connections', value: 'on' },
    { name: 'log_disconnections', value: 'off' },
    { name: 'log_retention_days', value: '3' },
  ];

  test('should return value if found', () => {
    expect(getConfiguration(configurations, 'log_disconnections')).toBe('off');
  });

  test('should return undefined if not found', () => {
    expect(getConfiguration(configurations, 'missing_name')).toBeUndefined();
  });

  describe('type: number', () => {
    test('should return number if convertable', () => {
      expect(
        getConfiguration(configurations, 'log_retention_days', 'number'),
      ).toBe(3);
    });

    test('should return original value if not convertable', () => {
      expect(
        getConfiguration(configurations, 'log_disconnections', 'number'),
      ).toBe('off');
    });

    test('should return undefined if not found', () => {
      expect(
        getConfiguration(configurations, 'missing_name', 'number'),
      ).toBeUndefined();
    });
  });
});
