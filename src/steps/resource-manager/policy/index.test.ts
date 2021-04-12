import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import {
  fetchPolicyAssignments,
  fetchPolicyDefinitionsForAssignments,
} from '.';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';
import { PolicyEntities, PolicyRelationships } from './constants';
import { filterGraphObjects } from '../../../../test/helpers/filterGraphObjects';
import { Entity, Relationship } from '@jupiterone/integration-sdk-core';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('rm-policy-assignments', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    return { accountEntity };
  }
  test('sucess', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-policy-assignments',
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

    await fetchPolicyAssignments(context);

    const policyAssignmentEntities = context.jobState.collectedEntities;

    expect(policyAssignmentEntities.length).toBeGreaterThan(0);
    expect(policyAssignmentEntities).toMatchGraphObjectSchema({
      _class: PolicyEntities.POLICY_ASSIGNMENT._class,
    });

    expect(context.jobState.collectedRelationships).toHaveLength(0);
  });
});

describe('rm-policy-definitions', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchPolicyAssignments(context);

    const policyAssignmentEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PolicyEntities.POLICY_ASSIGNMENT._type,
    );
    expect(policyAssignmentEntities.length).toBeGreaterThan(0);

    return {
      accountEntity,
      policyAssignmentEntities: [policyAssignmentEntities[0]],
    };
  }

  function separatePolicyDefinitionEntities(collectedEntities: Entity[]) {
    const {
      targets: policyDefinitionEntities,
      rest: restAfterPolicyDefinitions,
    } = filterGraphObjects(
      collectedEntities,
      (e) => e._type === PolicyEntities.POLICY_DEFINITION._type,
    );
    const {
      targets: policySetDefinitionEntites,
      rest: restAfterPolicySetDefinitions,
    } = filterGraphObjects(
      restAfterPolicyDefinitions,
      (e) => e._type === PolicyEntities.POLICY_SET_DEFINITION._type,
    );

    return {
      policyDefinitionEntities,
      policySetDefinitionEntites,
      rest: restAfterPolicySetDefinitions,
    };
  }

  function separatePolicyDefinitionRelationships(
    collectedRelationships: Relationship[],
  ) {
    const {
      targets: policyAssignmentDefinitionRelationships,
      rest: restAfterPolicyAssignmentDefinitions,
    } = filterGraphObjects(
      collectedRelationships,
      (e) =>
        e._type ===
        PolicyRelationships.AZURE_POLICY_ASSIGNMENT_USES_POLICY_DEFINITION
          ._type,
    );
    const {
      targets: policyAssignmentSetDefinitionRelationships,
      rest: restAfterPolicyAssignmentSetDefinitions,
    } = filterGraphObjects(
      restAfterPolicyAssignmentDefinitions,
      (e) =>
        e._type ===
        PolicyRelationships.AZURE_POLICY_ASSIGNMENT_USES_POLICY_SET_DEFINITION
          ._type,
    );
    const {
      targets: policySetDefinitionRelationships,
      rest: restAfterPolicySetDefinitions,
    } = filterGraphObjects(
      restAfterPolicyAssignmentSetDefinitions,
      (e) =>
        e._type ===
        PolicyRelationships.AZURE_POLICY_SET_DEFINITION_CONTAINS_DEFINITION
          ._type,
    );

    return {
      policyAssignmentDefinitionRelationships,
      policyAssignmentSetDefinitionRelationships,
      policySetDefinitionRelationships,
      rest: restAfterPolicySetDefinitions,
    };
  }
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-policy-definitions',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, policyAssignmentEntities } = await getSetupEntities(
      configFromEnv,
    );

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...policyAssignmentEntities],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchPolicyDefinitionsForAssignments(context);

    const {
      policyDefinitionEntities,
      policySetDefinitionEntites,
      rest: restEntities,
    } = separatePolicyDefinitionEntities(context.jobState.collectedEntities);

    expect(policyDefinitionEntities.length).toBeGreaterThan(0);
    expect(policyDefinitionEntities).toMatchGraphObjectSchema({
      _class: PolicyEntities.POLICY_DEFINITION._class,
    });

    expect(policySetDefinitionEntites.length).toBeGreaterThan(0);
    expect(policySetDefinitionEntites).toMatchGraphObjectSchema({
      _class: PolicyEntities.POLICY_SET_DEFINITION._class,
    });

    expect(restEntities).toHaveLength(0);

    const {
      policyAssignmentDefinitionRelationships,
      policyAssignmentSetDefinitionRelationships,
      policySetDefinitionRelationships,
      rest: restRelationships,
    } = separatePolicyDefinitionRelationships(
      context.jobState.collectedRelationships,
    );

    expect(
      policyAssignmentDefinitionRelationships.length +
        policyAssignmentSetDefinitionRelationships.length,
    ).toBe(policyAssignmentEntities.length);
    expect(
      policyAssignmentDefinitionRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              PolicyRelationships.AZURE_POLICY_ASSIGNMENT_USES_POLICY_DEFINITION
                ._type,
          },
        },
      },
    });
    expect(
      policyAssignmentSetDefinitionRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              PolicyRelationships
                .AZURE_POLICY_ASSIGNMENT_USES_POLICY_SET_DEFINITION._type,
          },
        },
      },
    });
    expect(policySetDefinitionRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              PolicyRelationships
                .AZURE_POLICY_SET_DEFINITION_CONTAINS_DEFINITION._type,
          },
        },
      },
    });

    expect(restRelationships).toHaveLength(0);
  }, 150000);
});
