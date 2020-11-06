import { createAzureWebLinker } from '../../../azure';
import { createMonitorLogProfileEntity } from './converters';
import { LogProfileResource } from '@azure/arm-monitor/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createMonitorLogProfileEntity', () => {
  test('properties transferred', () => {
    const data: LogProfileResource = {
      id:
        '/subscriptions/df602c9c-7aa0-407d-a6fb-eb20c8bd1192/providers/microsoft.insights/logprofiles/default',
      type: '',
      name: 'default',
      location: '',
      storageAccountId:
        '/subscriptions/df602c9c-7aa0-407d-a6fb-eb20c8bd1192/resourceGroups/JohnKemTest/providers/Microsoft.Storage/storageAccounts/johnkemtest8162',
      serviceBusRuleId: '',
      locations: ['global'],
      categories: ['Delete', 'Write', 'Action'],
      retentionPolicy: {
        enabled: true,
        days: 3,
      },
    };

    const logProfileEntity = createMonitorLogProfileEntity(webLinker, data);

    expect(logProfileEntity).toMatchSnapshot();
    expect(logProfileEntity).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: true,
        properties: {
          storageAccountId: { type: 'string' },
          serviceBusRuleId: { type: 'string' },
          locations: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } },
          'retentionPolicy.enabled': { type: 'boolean' },
          'retentionPolicy.days': { type: 'number' },
        },
      },
    });
  });
});
