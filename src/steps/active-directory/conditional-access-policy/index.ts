import { AzureIntegrationStep } from '../../../types';
import { conditionalAccessStep } from './entities/conditional-access';
import { conditionalAccessAuthorizationContextStep } from './entities/conditional-access-authorization-context';
import { conditionalAccessNamedLocatoinStep } from './entities/conditional-access-named-policy';
import { conditionalAccessPolicyStep } from './entities/conditional-access-policy';
import { conditionalAccessTemplateStep } from './entities/conditional-access-template';
import { conditionalAccessHasConditionalAccessAuthContextsStep } from './relationships/conditional-access-has-conditional-access-auth-context';
import { conditionalAccessHasConditionalAccessPoliciesStep } from './relationships/conditional-access-has-conditional-access-policy';
import { conditionalAccessHasConditionalAccessTemplateStep } from './relationships/conditional-access-has-conditional-access-template';
import { conditionalAccessPolicyAssignedADGroupsStep } from './relationships/conditional-access-policy-assigned-azure-groups';
import { conditionalAccessPolicyAssignedADUsersStep } from './relationships/conditional-access-policy-assigned-azure-users';
import { conditionalAccessPolicyContainsNamedLocationStep } from './relationships/conditional-access-policy-contains-named-location';

export const conditionalAccessPolicySteps: AzureIntegrationStep[] = [
  conditionalAccessStep,
  conditionalAccessPolicyStep,
  conditionalAccessNamedLocatoinStep,
  conditionalAccessAuthorizationContextStep,
  conditionalAccessTemplateStep,
  conditionalAccessHasConditionalAccessPoliciesStep,
  conditionalAccessHasConditionalAccessAuthContextsStep,
  conditionalAccessHasConditionalAccessTemplateStep,
  conditionalAccessPolicyContainsNamedLocationStep,
  conditionalAccessPolicyAssignedADUsersStep,
  conditionalAccessPolicyAssignedADGroupsStep,
];
