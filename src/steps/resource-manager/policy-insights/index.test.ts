import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
import {
  buildPolicyStateAssignmentRelationships,
  buildPolicyStateDefinitionRelationships,
  buildPolicyStateResourceRelationships,
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
import { fetchKeyVaults } from '../key-vault';
import { KEY_VAULT_SERVICE_ENTITY_TYPE } from '../key-vault/constants';

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
  test('success', async () => {
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

    await fetchLatestPolicyStatesForSubscription(context as IntegrationStepContext);

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

    await fetchLatestPolicyStatesForSubscription(context as IntegrationStepContext);
    const policyStateEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PolicyInsightEntities.POLICY_STATE._type,
    );
    expect(policyStateEntities.length).toBeGreaterThan(0);

    await fetchPolicyAssignments(context as IntegrationStepContext);
    const policyAssignmentEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PolicyEntities.POLICY_ASSIGNMENT._type,
    );
    expect(policyAssignmentEntities.length).toBeGreaterThan(0);

    return { accountEntity, policyStateEntities, policyAssignmentEntities };
  }
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-policy-state-to-policy-assignment-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, policyStateEntities, policyAssignmentEntities } =
      await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...policyStateEntities, ...policyAssignmentEntities],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await buildPolicyStateAssignmentRelationships(context as IntegrationStepContext);

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

    await fetchLatestPolicyStatesForSubscription(context as IntegrationStepContext);
    const policyStateEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PolicyInsightEntities.POLICY_STATE._type,
    );
    expect(policyStateEntities.length).toBeGreaterThan(0);

    await fetchPolicyAssignments(context as IntegrationStepContext);
    await fetchPolicyDefinitionsForAssignments(context as IntegrationStepContext);
    const policyDefinitionEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PolicyEntities.POLICY_DEFINITION._type,
    );
    expect(policyDefinitionEntities.length).toBeGreaterThan(0);

    return { accountEntity, policyStateEntities, policyDefinitionEntities };
  }
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-policy-state-to-policy-definition-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, policyStateEntities, policyDefinitionEntities } =
      await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...policyStateEntities, ...policyDefinitionEntities],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await buildPolicyStateDefinitionRelationships(context as IntegrationStepContext);

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

describe('rm-policy-state-to-resource-relationships', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchLatestPolicyStatesForSubscription(context as IntegrationStepContext);
    const policyStateEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PolicyInsightEntities.POLICY_STATE._type,
    );
    expect(policyStateEntities.length).toBeGreaterThan(0);

    await fetchKeyVaults(context as IntegrationStepContext);
    const keyVaultEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === KEY_VAULT_SERVICE_ENTITY_TYPE,
    );
    expect(keyVaultEntities.length).toBeGreaterThan(0);

    return { accountEntity, policyStateEntities, keyVaultEntities };
  }
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-policy-state-to-resource-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, policyStateEntities, keyVaultEntities } =
      await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...policyStateEntities, ...keyVaultEntities],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await buildPolicyStateResourceRelationships(context as IntegrationStepContext);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const policyStateResourceRelationships =
      context.jobState.collectedRelationships;
    expect(policyStateResourceRelationships.length).toBeGreaterThan(0);
    expect(policyStateResourceRelationships).toMatchDirectRelationshipSchema(
      {},
    );
  });
});
