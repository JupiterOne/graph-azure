import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { fetchActivityLogAlerts, fetchLogProfiles } from '.';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import {
  getMockAccountEntity,
  getMockResourceGroupEntity,
} from '../../../../test/helpers/getMockEntity';
import { MonitorEntities, MonitorRelationships } from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step = monitor log profiles', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
    subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
    developerId: 'keionned',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-monitor-log-profiles',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}`,
        _class: ['Group'],
        _type: 'azure_subscription',
        id: `/subscriptions/${instanceConfig.subscriptionId}`,
      },
      {
        _class: ['Service'],
        _type: 'azure_storage_account',
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        name: `j1devlogprofilestrgacct`,
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchLogProfiles(context);

  const { collectedEntities, collectedRelationships } = context.jobState;

  expect(collectedEntities.length).toBeGreaterThan(0);

  expect(collectedRelationships).toMatchDirectRelationshipSchema({});
  expect(collectedRelationships).toContainEqual(
    expect.objectContaining({
      _key: `/subscriptions/${instanceConfig.subscriptionId}|has|/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/logprofiles/default`,
      _type: 'azure_subscription_has_monitor_log_profile',
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/logprofiles/default`,
      displayName: 'HAS',
    }),
  );
  expect(collectedRelationships).toContainEqual(
    expect.objectContaining({
      _key: `/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/logprofiles/default|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      _type: 'azure_monitor_log_profile_uses_storage_account',
      _class: 'USES',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/logprofiles/default`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
      displayName: 'USES',
    }),
  );
});

describe('rm-monitor-activity-log-alerts', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const resourceGroupEntity = getMockResourceGroupEntity('j1dev');

    return { accountEntity, resourceGroupEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-monitor-activity-log-alerts',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, resourceGroupEntity } = getSetupEntities(
      configFromEnv,
    );

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [resourceGroupEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchActivityLogAlerts(context);

    const activityLogAlertEntities = context.jobState.collectedEntities;

    expect(activityLogAlertEntities.length).toBeGreaterThan(0);
    expect(activityLogAlertEntities).toMatchGraphObjectSchema({
      _class: MonitorEntities.ACTIVITY_LOG_ALERT._class,
      schema: MonitorEntities.ACTIVITY_LOG_ALERT.schema,
    });

    const resourceGroupActivityLogAlertRelationships =
      context.jobState.collectedRelationships;

    expect(resourceGroupActivityLogAlertRelationships.length).toBe(
      activityLogAlertEntities.length,
    );
    expect(
      resourceGroupActivityLogAlertRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              MonitorRelationships.RESOURCE_GROUP_HAS_ACTIVITY_LOG_ALERT._type,
          },
        },
      },
    });
  });
});
