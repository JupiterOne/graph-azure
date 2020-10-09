import { createAzureWebLinker } from '../../../azure';
import { createAssessmentEntity } from './converters';
import {
  SecurityAssessment,
  AzureResourceDetails,
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
