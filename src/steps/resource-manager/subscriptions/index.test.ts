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
import {
  createIntegrationEntity,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';

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

    const subscriptionId = 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7';
    const locations = [
      { name: 'eastasia', displayName: 'East Asia' },
      { name: 'southeastasia', displayName: 'Southeast Asia' },
      { name: 'centralus', displayName: 'Central US' },
      { name: 'eastus', displayName: 'East US' },
      { name: 'eastus2', displayName: 'East US 2' },
      { name: 'westus', displayName: 'West US' },
      { name: 'northcentralus', displayName: 'North Central US' },
      { name: 'southcentralus', displayName: 'South Central US' },
      { name: 'northeurope', displayName: 'North Europe' },
      { name: 'westeurope', displayName: 'West Europe' },
      { name: 'japanwest', displayName: 'Japan West' },
      { name: 'japaneast', displayName: 'Japan East' },
      { name: 'brazilsouth', displayName: 'Brazil South' },
      { name: 'australiaeast', displayName: 'Australia East' },
      { name: 'australiasoutheast', displayName: 'Australia Southeast' },
      { name: 'southindia', displayName: 'South India' },
      { name: 'centralindia', displayName: 'Central India' },
      { name: 'westindia', displayName: 'West India' },
      { name: 'canadacentral', displayName: 'Canada Central' },
      { name: 'canadaeast', displayName: 'Canada East' },
      { name: 'uksouth', displayName: 'UK South' },
      { name: 'ukwest', displayName: 'UK West' },
      { name: 'westcentralus', displayName: 'West Central US' },
      { name: 'westus2', displayName: 'West US 2' },
      { name: 'koreacentral', displayName: 'Korea Central' },
      { name: 'koreasouth', displayName: 'Korea South' },
      { name: 'francecentral', displayName: 'France Central' },
      { name: 'francesouth', displayName: 'France South' },
      { name: 'australiacentral', displayName: 'Australia Central' },
      { name: 'australiacentral2', displayName: 'Australia Central 2' },
      { name: 'uaecentral', displayName: 'UAE Central' },
      { name: 'uaenorth', displayName: 'UAE North' },
      { name: 'southafricanorth', displayName: 'South Africa North' },
      { name: 'southafricawest', displayName: 'South Africa West' },
      { name: 'switzerlandnorth', displayName: 'Switzerland North' },
      { name: 'switzerlandwest', displayName: 'Switzerland West' },
      { name: 'germanynorth', displayName: 'Germany North' },
      { name: 'germanywestcentral', displayName: 'Germany West Central' },
      { name: 'norwaywest', displayName: 'Norway West' },
      { name: 'norwayeast', displayName: 'Norway East' },
      { name: 'brazilsoutheast', displayName: 'Brazil Southeast' },
      { name: 'westus3', displayName: 'West US 3' },
    ];

    expect(subscriptionLocationMappedRelationships).toTargetEntities(
      locations.map((location) =>
        createIntegrationEntity({
          entityData: {
            source: {},
            assign: {
              _class: ['Site'],
              _type: 'azure_location',
              _key: `azure_location_${location.name}`,
              id: `/subscription/${subscriptionId}/locations/${location.name}`,
              name: location.name,
              displayName: location.displayName,
            },
          },
        }),
      ),
    );

    const locationNameMap = await context.jobState.getData<
      SetDataTypes['locationNameMap']
    >(setDataKeys.locationNameMap);

    expect(locationNameMap).not.toBeUndefined();
  });
});
