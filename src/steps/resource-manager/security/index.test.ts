import {
  fetchAssessments,
  fetchSecurityCenterAutoProvisioningSettings,
  fetchSecurityCenterContacts,
  fetchSecurityCenterPricingConfigurations,
  fetchSecurityCenterSettings,
} from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { entities as subscriptionEntities } from '../subscriptions/constants';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
import { SecurityEntities, SecurityRelationships } from './constants';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import {
  getMockAccountEntity,
  getMockSubscriptionEntity,
} from '../../../../test/helpers/getMockEntity';
import { getConfigForTest } from './__tests__/utils';

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

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
        _type: subscriptionEntities.SUBSCRIPTION._type,
        _class: subscriptionEntities.SUBSCRIPTION._class,
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

test('step - security center contacts', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
    subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-security-center-contacts',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      {
        _key: `/subscriptions/${instanceConfig.subscriptionId}`,
        _type: subscriptionEntities.SUBSCRIPTION._type,
        _class: subscriptionEntities.SUBSCRIPTION._class,
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchSecurityCenterContacts(context);

  const { collectedEntities, collectedRelationships } = context.jobState;

  expect(collectedEntities.length).toBeGreaterThan(0);
  expect(collectedEntities).toMatchGraphObjectSchema({
    _class: ['Resource'],
  });

  expect(collectedRelationships).toMatchDirectRelationshipSchema({});
  expect(collectedRelationships).toContainEqual(
    expect.objectContaining({
      _key: `/subscriptions/${instanceConfig.subscriptionId}|has|/subscriptions/${instanceConfig.subscriptionId}/providers/Microsoft.Security/securityContact/default1`,
      _type: 'azure_subscription_has_security_center_contact',
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/providers/Microsoft.Security/securityContact/default1`,
      displayName: 'HAS',
    }),
  );
});

describe('rm-security-center-pricing-configs', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const subscriptionEntity = getMockSubscriptionEntity(config);
    return { accountEntity, subscriptionEntity };
  }

  test('success', async () => {
    const config = getConfigForTest(configFromEnv);

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-security-center-pricing-configs',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config }),
      },
    });

    const { accountEntity, subscriptionEntity } = getSetupEntities(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      entities: [subscriptionEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchSecurityCenterPricingConfigurations(context);

    const pricingEntities = context.jobState.collectedEntities;

    expect(pricingEntities.length).toBeGreaterThan(0);
    expect(pricingEntities).toMatchGraphObjectSchema({
      _class: SecurityEntities.SUBSCRIPTION_PRICING._class,
    });

    const subscriptionPricingRelationships =
      context.jobState.collectedRelationships;

    expect(subscriptionPricingRelationships.length).toBe(
      pricingEntities.length,
    );
    expect(subscriptionPricingRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: SecurityRelationships.SUBSCRIPTION_HAS_PRICING_CONFIG._type,
          },
        },
      },
    });
  });
});

describe('rm-security-center-settings', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const subscriptionEntity = getMockSubscriptionEntity(config);
    return { accountEntity, subscriptionEntity };
  }

  test('success', async () => {
    const config = getConfigForTest(configFromEnv);

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-security-center-settings',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config }),
      },
    });

    const { accountEntity, subscriptionEntity } = getSetupEntities(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      entities: [subscriptionEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchSecurityCenterSettings(context);

    const securityCenterSettingEntities = context.jobState.collectedEntities;

    expect(securityCenterSettingEntities.length).toBeGreaterThan(0);
    expect(securityCenterSettingEntities).toMatchGraphObjectSchema({
      _class: SecurityEntities.SETTING._class,
      schema: SecurityEntities.SETTING.schema,
    });

    const subscriptionSettingRelationships =
      context.jobState.collectedRelationships;

    expect(subscriptionSettingRelationships.length).toBe(
      securityCenterSettingEntities.length,
    );
    expect(subscriptionSettingRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: SecurityRelationships.SUBSCRIPTION_HAS_SETTING._type,
          },
        },
      },
    });
  });
});

describe('rm-security-center-auto-provisioning-settings', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const subscriptionEntity = getMockSubscriptionEntity(config);
    return { accountEntity, subscriptionEntity };
  }

  test('success', async () => {
    const config = getConfigForTest(configFromEnv);

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-security-center-auto-provisioning-settings',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config }),
      },
    });

    const { accountEntity, subscriptionEntity } = getSetupEntities(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      entities: [subscriptionEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchSecurityCenterAutoProvisioningSettings(context);

    const securityCenterAutoProvisioningSettingEntities =
      context.jobState.collectedEntities;

    expect(
      securityCenterAutoProvisioningSettingEntities.length,
    ).toBeGreaterThan(0);
    expect(
      securityCenterAutoProvisioningSettingEntities,
    ).toMatchGraphObjectSchema({
      _class: SecurityEntities.AUTO_PROVISIONING_SETTING._class,
      schema: SecurityEntities.AUTO_PROVISIONING_SETTING.schema,
    });

    const subscriptionAutoProvisioningSettingRelationships =
      context.jobState.collectedRelationships;

    expect(subscriptionAutoProvisioningSettingRelationships.length).toBe(
      securityCenterAutoProvisioningSettingEntities.length,
    );
    expect(
      subscriptionAutoProvisioningSettingRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              SecurityRelationships.SUBSCRIPTION_HAS_AUTO_PROVISIONING_SETTING
                ._type,
          },
        },
      },
    });
  });
});
