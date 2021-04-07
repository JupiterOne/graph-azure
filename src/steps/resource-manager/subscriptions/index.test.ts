import { fetchLocations, fetchSubscription } from '.';
import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
import {
  entities,
  relationships,
  setDataKeys,
  SetDataTypes,
} from './constants';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';
import { IntegrationError } from '@jupiterone/integration-sdk-core';

let recording: Recording;

describe('step - subscription', () => {
  let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect a Subscription entity based on config.subscriptionId', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-resource-groups',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: configFromEnv,
          shouldReplaceSubscriptionId: () => true,
        }),
      },
    });

    context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchSubscription(context);

    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: entities.SUBSCRIPTION._class,
        _type: entities.SUBSCRIPTION._type,
        _key: `/subscriptions/${configFromEnv.subscriptionId}`,
        id: `/subscriptions/${configFromEnv.subscriptionId}`,
        name: expect.any(String),
        displayName: expect.any(String),
        subscriptionId: configFromEnv.subscriptionId,
        state: 'Enabled',
        authorizationSource: 'RoleBased',
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${configFromEnv.subscriptionId}`,
      }),
    );
  });

  it('should throw an error if a subscription could not be found ', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-resource-groups-error',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: configFromEnv,
          shouldReplaceSubscriptionId: () => true,
        }),
        recordFailedRequests: true,
      },
    });

    const fakeSubscriptionId = '123456e8-4ba7-457b-8d50-471c39f52dcb';
    context = createMockAzureStepExecutionContext({
      instanceConfig: { ...configFromEnv, subscriptionId: fakeSubscriptionId },
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });
    await expect(
      async () => await fetchSubscription(context),
    ).rejects.toThrowError(IntegrationError);
  });
});

describe('rm-subscription-locations', () => {
  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const subscriptionEntity = {
      _key: 'subscription-entity-key',
      _type: entities.SUBSCRIPTION._type,
      _class: entities.SUBSCRIPTION._class,
      subscriptionId: config.subscriptionId,
    };

    return { accountEntity, subscriptionEntity };
  }
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-subscription-locations',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, subscriptionEntity } = getSetupEntities(
      configFromEnv,
    );

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [subscriptionEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchLocations(context);

    const locationEntities = context.jobState.collectedEntities;

    expect(locationEntities.length).toBeGreaterThan(0);
    expect(locationEntities).toMatchGraphObjectSchema({
      _class: entities.LOCATION._class,
    });

    const subscriptionLocationRelationships =
      context.jobState.collectedRelationships;

    expect(subscriptionLocationRelationships.length).toBe(
      locationEntities.length,
    );
    expect(subscriptionLocationRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: relationships.SUBSCRIPTION_USES_LOCATION._type },
        },
      },
    });

    const locationNameMap = await context.jobState.getData<
      SetDataTypes['locationNameMap']
    >(setDataKeys.locationNameMap);

    expect(locationNameMap).not.toBeUndefined();
    expect(Object.values(locationNameMap!)).toEqual(locationEntities);
  });
});
