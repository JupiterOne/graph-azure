import { createAzureWebLinker } from '../../../azure';
import { createPolicyAssignmentEntity } from './converters';
import { PolicyAssignment } from '@azure/arm-policy/esm/models';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createPolicyAssignmentEntity', () => {
  test('properties transferred', () => {
    const data: PolicyAssignment = {
      displayName: 'Enforce resource naming rules',
      description:
        'Force resource names to begin with given DeptA and end with -LC',
      metadata: {
        assignedBy: 'Someone Special',
      },
      policyDefinitionId:
        '/subscriptions/ae640e6b-ba3e-4256-9d62-2993eecfa6f2/providers/Microsoft.Authorization/policyDefinitions/ResourceNaming',
      notScopes: [],
      parameters: {
        prefix: {
          value: 'DeptA',
        },
        suffix: {
          value: '-LC',
        },
      },
      enforcementMode: 'Default',
      scope: 'subscriptions/ae640e6b-ba3e-4256-9d62-2993eecfa6f2',
      id:
        '/subscriptions/ae640e6b-ba3e-4256-9d62-2993eecfa6f2/providers/Microsoft.Authorization/policyAssignments/EnforceNaming',
      type: 'Microsoft.Authorization/policyAssignments',
      name: 'EnforceNaming',
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
            const: 'subscriptions/ae640e6b-ba3e-4256-9d62-2993eecfa6f2',
          },
          policyDefinitionId: {
            const:
              '/subscriptions/ae640e6b-ba3e-4256-9d62-2993eecfa6f2/providers/Microsoft.Authorization/policyDefinitions/ResourceNaming',
          },
        },
      },
    });
  });
});
