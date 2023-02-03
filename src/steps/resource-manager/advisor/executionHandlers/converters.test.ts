import { createAzureWebLinker } from '../../../../azure';
import { createRecommendationEntity } from '../converters';
import { ResourceRecommendationBase } from '@azure/arm-advisor/esm/models';
import { AdvisorEntities } from '../constants';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createRecommendationEntity', () => {
  test('properties transferred', () => {
    const data: ResourceRecommendationBase = {
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/ndowmon1-j1dev/providers/Microsoft.Advisor/recommendations/55c89362-b09e-3290-9517-b1441e537514',
      name: '55c89362-b09e-3290-9517-b1441e537514',
      type: 'Microsoft.Advisor/recommendations',
      category: 'Security',
      impact: 'Low',
      impactedField: 'Microsoft.KeyVault/vaults',
      impactedValue: 'ndowmon1-j1dev',
      lastUpdated: new Date('2020-10-08T13:53:03.299Z'),
      recommendationTypeId: '88bbc99c-e5af-ddd7-6105-6150b2bfa519',
      shortDescription: {
        problem: 'Diagnostic logs in Key Vault should be enabled',
        solution: 'Diagnostic logs in Key Vault should be enabled',
      },
      extendedProperties: {
        assessmentKey: '88bbc99c-e5af-ddd7-6105-6150b2bfa519',
        score: '5',
      },
      resourceMetadata: {
        resourceId:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/ndowmon1-j1dev',
        source:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/ndowmon1-j1dev/providers/Microsoft.Security/assessments/88bbc99c-e5af-ddd7-6105-6150b2bfa519',
      },
    };

    expect(
      createRecommendationEntity(webLinker, data),
    ).toMatchGraphObjectSchema({
      _class: AdvisorEntities.RECOMMENDATION._class,
    });
    expect(createRecommendationEntity(webLinker, data)).toMatchSnapshot();
  });
});
