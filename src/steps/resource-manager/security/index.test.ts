import { fetchAssessments } from '.';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { SUBSCRIPTION_ENTITY_METADATA } from '../subscriptions';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { SecurityEntities } from './constants';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - security assessments', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-security-assessments',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
        _type: SUBSCRIPTION_ENTITY_METADATA._type,
        _class: SUBSCRIPTION_ENTITY_METADATA._class,
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchAssessments(context);

  const { collectedEntities, collectedRelationships } = context.jobState;

  expect(collectedEntities.length).toBeGreaterThan(0);
  expect(collectedEntities).toMatchGraphObjectSchema({
    _class: SecurityEntities.ASSESSMENT._class,
  });

  expect(collectedRelationships.length).toBeGreaterThan(0);
  expect(collectedRelationships).toMatchDirectRelationshipSchema({});
});
