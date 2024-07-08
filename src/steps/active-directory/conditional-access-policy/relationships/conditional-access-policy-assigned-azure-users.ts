import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  AzureIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import {
  ConditionalAccessEntities,
  ConditionalAccessRelationships,
  ConditionalAccessSteps,
} from '../constants';
import { STEP_AD_USERS, USER_ENTITY_TYPE } from '../../constants';
import { INGESTION_SOURCE_IDS } from '../../../../constants';

export async function buildConditionalAccessPolicyAssignedUsersRelationships(
  executionContext: IntegrationStepContext,
) {
  const { jobState, logger } = executionContext;

  await jobState.iterateEntities(
    { _type: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type },
    async (conditionalPolicy) => {
      const userIds = conditionalPolicy.includeUsers as string[];
      for (const userID of userIds || []) {
        if (userID === 'None') {
          break;
        } else if (userID === 'All') {
          await jobState.iterateEntities(
            { _type: USER_ENTITY_TYPE },
            async (adUser) => {
              await jobState.addRelationship(
                createDirectRelationship({
                  _class: RelationshipClass.ASSIGNED,
                  fromKey: conditionalPolicy._key,
                  fromType:
                    ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type,
                  toKey: adUser._key,
                  toType: USER_ENTITY_TYPE,
                }),
              );
            },
          );
        } else {
          if (jobState.hasKey(userID)) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.ASSIGNED,
                fromKey: conditionalPolicy._key,
                fromType:
                  ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type,
                toKey: userID,
                toType: USER_ENTITY_TYPE,
              }),
            );
          } else {
            logger.warn('Ad User key missing ' + userID);
          }
        }
      }
    },
  );
}

export const conditionalAccessPolicyAssignedADUsersStep: AzureIntegrationStep =
  {
    id: ConditionalAccessSteps.CONDITIONAL_ACCESS_POLICY_ASSIGNED_AD_USERS,
    name: 'Conditional Access Policy Assigned AD Users Relationships',
    entities: [],
    relationships: [
      ConditionalAccessRelationships.CONDITIONAL_ACCESS_POLICY_ASSIGNED_AD_USERS,
    ],
    dependsOn: [
      STEP_AD_USERS,
      ConditionalAccessSteps.CONDITIONAL_ACCESS_POLICY,
    ],
    executionHandler: buildConditionalAccessPolicyAssignedUsersRelationships,
    ingestionSourceId:
      INGESTION_SOURCE_IDS.CONDITIONAL_ACCESS_USER_RELATIONSHIP,
  };
