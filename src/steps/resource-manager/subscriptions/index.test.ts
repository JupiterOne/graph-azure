import { fetchSubscriptions } from '.';
import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
import { MonitorEntities } from '../monitor/constants';
import { SUBSCRIPTION_ENTITY_METADATA } from './constants';
let recording: Recording;

afterAll(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('step - subscriptions', () => {
  let context: MockIntegrationStepExecutionContext<IntegrationConfig>;
  let instanceConfig: IntegrationConfig;

  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
      subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
      developerId: 'keionned',
    };

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-resource-groups',
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchSubscriptions(context);
  });

  it('should collect a Subscription entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: SUBSCRIPTION_ENTITY_METADATA._class,
        _type: SUBSCRIPTION_ENTITY_METADATA._type,
        _key: `/subscriptions/${instanceConfig.subscriptionId}`,
        id: `/subscriptions/${instanceConfig.subscriptionId}`,
        name: expect.any(String),
        displayName: expect.any(String),
        subscriptionId: instanceConfig.subscriptionId,
        state: 'Enabled',
        authorizationSource: 'RoleBased',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}`,
      }),
    );
  });

  it('should collect the first Diagnostic Log Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/diagnosticSettings/j1dev_sub_diag_set/logs/Policy/true/undefined/undefined`,
        _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
        category: 'Policy',
        displayName: 'j1dev_sub_diag_set',
        enabled: true,
        eventHubAuthorizationRuleId: undefined,
        eventHubName: undefined,
        id: `/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/diagnosticSettings/j1dev_sub_diag_set/logs/Policy/true/undefined/undefined`,
        logAnalyticsDestinationType: undefined,
        name: 'j1dev_sub_diag_set',
        'retentionPolicy.days': undefined,
        'retentionPolicy.enabled': undefined,
        serviceBusRuleId: undefined,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/diagnosticSettings/j1dev_sub_diag_set`,
        workspaceId: undefined,
      }),
    );
  });

  it('should collect the second Diagnostic Log Setting entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: MonitorEntities.DIAGNOSTIC_LOG_SETTING._class,
        _key: `/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/diagnosticSettings/j1dev_sub_diag_set/logs/Security/true/undefined/undefined`,
        _type: MonitorEntities.DIAGNOSTIC_LOG_SETTING._type,
        category: 'Security',
        displayName: 'j1dev_sub_diag_set',
        enabled: true,
        eventHubAuthorizationRuleId: undefined,
        eventHubName: undefined,
        id: `/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/diagnosticSettings/j1dev_sub_diag_set/logs/Security/true/undefined/undefined`,
        logAnalyticsDestinationType: undefined,
        name: 'j1dev_sub_diag_set',
        'retentionPolicy.days': undefined,
        'retentionPolicy.enabled': undefined,
        serviceBusRuleId: undefined,
        storageAccountId: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/${instanceConfig.developerId}j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/diagnosticSettings/j1dev_sub_diag_set`,
        workspaceId: undefined,
      }),
    );
  });

  it('should collect the first Diagnostic Log Setting uses Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}|has|/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/diagnosticSettings/j1dev_sub_diag_set/logs/Policy/true/undefined/undefined`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/diagnosticSettings/j1dev_sub_diag_set/logs/Policy/true/undefined/undefined`,
      _type: 'azure_resource_has_diagnostic_log_setting',
      displayName: 'HAS',
    });
  });

  it('should collect the second Diagnostic Log Setting uses Storage Account relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}|has|/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/diagnosticSettings/j1dev_sub_diag_set/logs/Security/true/undefined/undefined`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/providers/microsoft.insights/diagnosticSettings/j1dev_sub_diag_set/logs/Security/true/undefined/undefined`,
      _type: 'azure_resource_has_diagnostic_log_setting',
      displayName: 'HAS',
    });
  });
});
