import { createAzureWebLinker } from '../../../azure';
import {
  createAssessmentEntity,
  createSecurityContactEntity,
} from './converters';
import {
  SecurityAssessment,
  AzureResourceDetails,
  SecurityContact,
} from '@azure/arm-security/esm/models';
import { SecurityEntities } from './constants';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createAssessmentEntity', () => {
  test('properties transferred', () => {
    const data: SecurityAssessment = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.storage/storageaccounts/ndowmon1j1devblobstorage/providers/Microsoft.Security/assessments/51fd8bb1-0db4-bbf1-7e2b-cfcba7eb66a6',
      name: '51fd8bb1-0db4-bbf1-7e2b-cfcba7eb66a6',
      type: 'Microsoft.Security/assessments',
      displayName: 'Storage account public access should be disallowed',
      status: { code: 'Unhealthy' },
      // Azure SDK for JS typing defines AzureResourceDetails as { source: "Azure", readonly id?: string }, although
      // the Assessments API returns capitalized property names.
      resourceDetails: ({
        Source: 'Azure',
        Id:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.storage/storageaccounts/ndowmon1j1devblobstorage',
      } as unknown) as AzureResourceDetails,
    };

    const assessmentEntity = createAssessmentEntity(webLinker, data);

    expect(assessmentEntity).toMatchGraphObjectSchema({
      _class: SecurityEntities.ASSESSMENT._class,
    });
    expect(assessmentEntity).toMatchSnapshot();
  });
});

describe('createSecurityContactEntity', () => {
  test('properties transferred', () => {
    const data: SecurityContact = {
      id:
        '/subscriptions/20ff7fc3-e762-44dd-bd96-b71116dcdc23/providers/Microsoft.Security/securityContacts/default2',
      name: 'default2',
      type: 'Microsoft.Security/securityContacts',
      email: 'chen@contoso.com',
      alertNotifications: 'On',
      alertsToAdmins: 'On',
    };

    const securityContactEntity = createSecurityContactEntity(webLinker, data);

    expect(securityContactEntity).toMatchSnapshot();
    expect(securityContactEntity).toMatchGraphObjectSchema({
      _class: [''],
      schema: {
        additionalProperties: true,
        properties: {
          email: { type: 'string' },
          phone: { type: 'string' },
          alertNotifications: { type: 'string', enum: ['On', 'Off'] },
          alertsToAdmins: { type: 'string', enum: ['On', 'Off'] },
        },
      },
    });
  });
});
