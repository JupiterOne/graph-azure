import {
  fetchAssessments,
  fetchSecurityCenterContacts,
  fetchSecurityCenterPricingConfigurations,
} from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { entities as subscriptionEntities } from '../subscriptions/constants';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { SecurityEntities, SecurityRelationships } from './constants';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';
import { v4 as uuid } from 'uuid';

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

    const subscriptionId = `/subscriptions/${config.subscriptionId}`;
    const subscriptionEntity = {
      _key: subscriptionId,
      _type: 'subscription-type',
      _class: 'subscription-class',
    };

    return { accountEntity, subscriptionEntity };
  }

  function getConfigForTest(config: IntegrationConfig): IntegrationConfig {
    // The Azure Subscription Client has some validation before sending requests to
    // this endpoint that requires "subscriptionId" to be a UUID.
    //
    // When running tests in CI, we set the value of `config.subscriptionId` to "subscriptionId",
    // causing the Azure SDK to throw the following:
    //
    // "subscriptionId" with value "subscriptionId" should satisfy the constraint
    // "Pattern": /^[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}$/.

    const subscriptionIdValidationRegex = /^[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}$/;
    return {
      ...config,
      subscriptionId: subscriptionIdValidationRegex.test(
        config.subscriptionId || '',
      )
        ? config.subscriptionId
        : uuid(),
    };
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
