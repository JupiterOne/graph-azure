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
import { entities, setDataKeys, SetDataTypes } from './constants';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';
import { IntegrationError } from '@jupiterone/integration-sdk-core';

let recording: Recording;

describe('rm-subscription', () => {
  let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect a Subscription entity based on config.subscriptionId', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-subscription',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: configFromEnv,
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
        name: expect.any(String),
        displayName: expect.any(String),
        state: 'Enabled',
        authorizationSource: 'RoleBased',
      }),
    );
  });

  it('should throw an error if a subscription could not be found ', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-subscription-error',
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

describe.skip('rm-subscription-diagnostic-settings', () => {
  // Not implementing tests for diagnostic settings at this time.
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

    const subscriptionLocationMappedRelationships =
      context.jobState.collectedRelationships;

    expect(subscriptionLocationMappedRelationships.length).toBeGreaterThan(0);
    expect(
      subscriptionLocationMappedRelationships.every(
        (mappedRelationship) =>
          mappedRelationship._type === 'azure_subscription_uses_location' &&
          mappedRelationship._class === 'USES',
      ),
    ).toBe(true);

    const locationNameMap = await context.jobState.getData<
      SetDataTypes['locationNameMap']
    >(setDataKeys.locationNameMap);

    expect(locationNameMap).not.toBeUndefined();
  });
});
