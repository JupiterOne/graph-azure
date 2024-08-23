import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
import {
  fetchManagementGroups,
  validateManagementGroupStepInvocation,
} from '.';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';
import {
  ManagementGroupEntities,
  ManagementGroupRelationships,
} from './constants';
import { Relationship } from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from '../../../../test/helpers/filterGraphObjects';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('rm-management-groups', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    return { accountEntity };
  }

  function separateManagementGroupRelationships(
    collectedRelationships: Relationship[],
  ) {
    const { targets: mappedRelationships, rest: restAfterMapped } =
      filterGraphObjects(
        collectedRelationships,
        (r) => r._mapping !== undefined,
      );
    const {
      targets: accountManagementGroupRelationships,
      rest: restAfterAccountGroup,
    } = filterGraphObjects(
      restAfterMapped,
      (r) =>
        r._type ===
        ManagementGroupRelationships.ACCOUNT_HAS_ROOT_MANAGEMENT_GROUP._type,
    );
    const {
      targets: managementGroupGroupRelationships,
      rest: restAfterGroupGroup,
    } = filterGraphObjects(
      restAfterAccountGroup,
      (r) =>
        r._type ===
        ManagementGroupRelationships.MANAGEMENT_GROUP_CONTAINS_MANAGEMENT_GROUP
          ._type,
    );

    return {
      mappedRelationships,
      accountManagementGroupRelationships,
      managementGroupGroupRelationships,
      rest: restAfterGroupGroup,
    };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-management-groups',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity } = getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [accountEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchManagementGroups(context);

    const managementGroupEntities = context.jobState.collectedEntities;

    // Require 2 or more management group entities to ensure that recursion works as expected.
    expect(managementGroupEntities.length).toBeGreaterThan(1);
    expect(managementGroupEntities).toMatchGraphObjectSchema({
      _class: ManagementGroupEntities.MANAGEMENT_GROUP._class,
    });

    const {
      accountManagementGroupRelationships,
      managementGroupGroupRelationships,
      mappedRelationships: managementGroupSubscriptionRelationships,
      rest: restRelationships,
    } = separateManagementGroupRelationships(
      context.jobState.collectedRelationships,
    );

    // There should be exactly 1 relationship between management group + account - the Tenant Root Group
    expect(accountManagementGroupRelationships).toHaveLength(1);
    // Every management group _except 1_ (the Tenant Root Group) has a parent.
    expect(managementGroupGroupRelationships).toHaveLength(
      managementGroupEntities.length - 1,
    );
    // Require at least 1 management group to ensure mapped relationships work.
    expect(managementGroupSubscriptionRelationships.length).toBeGreaterThan(0);
    expect(restRelationships).toHaveLength(0);
  });
});

describe('validateManagementGroupStepInvocation', () => {
  test('should return undefiend when credentials allow fetching of management group', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateManagementGroupStepInvocation#success',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
    });

    const response = await validateManagementGroupStepInvocation(context);

    expect(response).toEqual(true);
  });

  test('should throw when invalid credentials are passed', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'validateManagementGroupStepInvocation#badCredentials',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        recordFailedRequests: true,
      },
    });

    const context = createMockAzureStepExecutionContext({
      instanceConfig: {
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        directoryId: 'directoryId',
        subscriptionId: 'subscription-id',
        defenderAlertsSeverities: 'HIGH,MEDIUM',
      },
    });

    expect(await validateManagementGroupStepInvocation(context)).toEqual(false);
  });
});
