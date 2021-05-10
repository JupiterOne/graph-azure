import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { fetchLatestPolicyStatesForSubscription } from '.';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';
import { PolicyInsightEntities } from './constants';

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
