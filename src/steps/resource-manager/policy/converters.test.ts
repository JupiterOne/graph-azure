import { createAzureWebLinker } from '../../../azure';
import { createPolicyAssignmentEntity } from './converters';
import { PolicyAssignment } from '@azure/arm-policy/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createPolicyAssignmentEntity', () => {
  test('properties transferred', () => {
    const data: PolicyAssignment = {
      sku: {
        name: 'A0',
        tier: 'Free',
      },
      displayName:
        'ASC Default (subscription: 40474ebe-55a2-4071-8fa8-b610acdd8e56)',
      policyDefinitionId:
        '/providers/Microsoft.Authorization/policySetDefinitions/1f3afdf9-d0c9-4c3d-847f-89da613e70a8',
      scope: '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56',
      notScopes: [],
      parameters: {
        systemUpdatesMonitoringEffect: {
          value: 'AuditIfNotExists',
        },
      },
      description:
        'This is the default set of policies monitored by Azure Security Center. It was automatically assigned as part of onboarding to Security Center. The default assignment contains only audit policies. For more information please visit https://aka.ms/ascpolicies',
      metadata: {
        assignedBy: 'Security Center',
        createdBy: '488baaae-0786-48e5-aa3d-6c7c773d9557',
        createdOn: '2020-09-24T16:32:06.2258988Z',
        updatedBy: '3b3dbbda-9a3c-4b0b-b2f4-60cfeaa74233',
        updatedOn: '2020-10-29T17:42:36.1625526Z',
        parameterScopes: {},
      },
      enforcementMode: 'Default',
      id: `/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/providers/Microsoft.Authorization/policyAssignments/SecurityCenterBuiltIn`,
      type: 'Microsoft.Authorization/policyAssignments',
      name: 'SecurityCenterBuiltIn',
    };

    const policyAssignmentEntity = createPolicyAssignmentEntity(
      webLinker,
      data,
    );

    expect(policyAssignmentEntity).toMatchSnapshot();
    expect(policyAssignmentEntity).toMatchGraphObjectSchema({
      _class: ['ControlPolicy'],
      schema: {
        additionalProperties: true,
        properties: {
          scope: {
            const: '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56',
          },
          policyDefinitionId: {
            const:
              '/providers/Microsoft.Authorization/policySetDefinitions/1f3afdf9-d0c9-4c3d-847f-89da613e70a8',
          },
        },
      },
    });
  });
});
