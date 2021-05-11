import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import {
  buildPolicyStateAssignmentRelationships,
  buildPolicyStateDefinitionRelationships,
  fetchLatestPolicyStatesForSubscription,
} from '.';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';
import { PolicyInsightEntities, PolicyInsightRelationships } from './constants';
import {
  fetchPolicyAssignments,
  fetchPolicyDefinitionsForAssignments,
} from '../policy';
import { PolicyEntities } from '../policy/constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('rm-policy-states-for-subscription', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    return { accountEntity };
  }
  test('sucess', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-policy-states-for-subscription',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity } = getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchLatestPolicyStatesForSubscription(context);

    const policyStateEntities = context.jobState.collectedEntities;

    expect(policyStateEntities.length).toBeGreaterThan(0);
    expect(policyStateEntities).toMatchGraphObjectSchema({
      _class: PolicyInsightEntities.POLICY_STATE._class,
    });

    expect(context.jobState.collectedRelationships).toHaveLength(0);
  });
});

describe('rm-policy-state-to-policy-assignment-relationships', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchLatestPolicyStatesForSubscription(context);
    const policyStateEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PolicyInsightEntities.POLICY_STATE._type,
    );
    expect(policyStateEntities.length).toBeGreaterThan(0);

    await fetchPolicyAssignments(context);
    const policyAssignmentEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PolicyEntities.POLICY_ASSIGNMENT._type,
    );
    expect(policyAssignmentEntities.length).toBeGreaterThan(0);

    return { accountEntity, policyStateEntities, policyAssignmentEntities };
  }
  test('sucess', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-policy-state-to-policy-assignment-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      accountEntity,
      policyStateEntities,
      policyAssignmentEntities,
    } = await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...policyStateEntities, ...policyAssignmentEntities],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await buildPolicyStateAssignmentRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const policyStateAssignmentRelationships =
      context.jobState.collectedRelationships;
    expect(policyStateAssignmentRelationships.length).toBe(
      policyStateEntities.length,
    );
    expect(policyStateAssignmentRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              PolicyInsightRelationships.POLICY_ASSIGNMENT_HAS_POLICY_STATE
                ._type,
          },
        },
      },
    });
  });
});

describe('rm-policy-state-to-policy-definition-relationships', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchLatestPolicyStatesForSubscription(context);
    const policyStateEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PolicyInsightEntities.POLICY_STATE._type,
    );
    expect(policyStateEntities.length).toBeGreaterThan(0);

    await fetchPolicyAssignments(context);
    await fetchPolicyDefinitionsForAssignments(context);
    const policyDefinitionEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PolicyEntities.POLICY_DEFINITION._type,
    );
    expect(policyDefinitionEntities.length).toBeGreaterThan(0);

    return { accountEntity, policyStateEntities, policyDefinitionEntities };
  }
  test('sucess', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-policy-state-to-policy-definition-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      accountEntity,
      policyStateEntities,
      policyDefinitionEntities,
    } = await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...policyStateEntities, ...policyDefinitionEntities],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await buildPolicyStateDefinitionRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const policyStateDefinitionRelationships =
      context.jobState.collectedRelationships;
    expect(policyStateDefinitionRelationships.length).toBe(
      policyStateEntities.length,
    );
    expect(policyStateDefinitionRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              PolicyInsightRelationships.POLICY_DEFINITION_DEFINES_POLICY_STATE
                ._type,
          },
        },
      },
    });
  }, 150_000);
});
