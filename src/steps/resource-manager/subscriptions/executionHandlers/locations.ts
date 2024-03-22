import {
  RelationshipClass,
  createMappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import {
  IntegrationStepContext,
  AzureIntegrationStep,
} from '../../../../types';
import { STEP_AD_ACCOUNT } from '../../../active-directory/constants';
import { J1SubscriptionClient } from '../client';
import {
  setDataKeys,
  SetDataTypes,
  entities,
  steps,
  mappedRelationships,
} from '../constants';
import { getLocationEntityProps } from '../converters';
import { INGESTION_SOURCE_IDS } from '../../../../constants';

export async function fetchLocations(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new J1SubscriptionClient(instance.config, logger);

  const locationNameMap: SetDataTypes['locationNameMap'] = {};

  await jobState.iterateEntities(
    { _type: entities.SUBSCRIPTION._type },
    async (subscriptionEntity) => {
      await client.iterateLocations(
        subscriptionEntity.subscriptionId as string,
        async (location) => {
          const locationProps = getLocationEntityProps(location);

          await jobState.addRelationship(
            createMappedRelationship({
              _class: RelationshipClass.USES,
              _type: mappedRelationships.SUBSCRIPTION_USES_LOCATION._type,
              source: subscriptionEntity,
              target: locationProps,
              targetFilterKeys: [['_key']],
              relationshipDirection: RelationshipDirection.FORWARD,
              skipTargetCreation: false,
            }),
          );

          if (location.name) {
            if (locationNameMap[location.name!] !== undefined) {
              // In order to future-proof this function (considering a world where more than
              // 1 subscription is ingested in an integration), alert the operators if more
              // than one location name exists.
              logger.warn(
                {
                  newLocationName: location.id,
                  currentLocationId: locationNameMap[location.name!]?.id,
                },
                'ERROR: Multiple azure_location entities were encountered with the same `name`. There may be multiple subscriptions ingested, which this function is not equipped to handle.',
              );
            } else {
              locationNameMap[location.name!] = locationProps;
            }
          } else {
            logger.warn(
              {
                locationId: location.id,
                locationName: location.name,
              },
              'ERROR: Azure location.name property is undefined; cannot add to locationNameMap!',
            );
          }
        },
      );
    },
  );
  await jobState.setData(setDataKeys.locationNameMap, locationNameMap);
}

export const locationSteps: AzureIntegrationStep[] = [
  {
    id: steps.LOCATIONS,
    name: 'Subscription Locations',
    entities: [],
    relationships: [],
    mappedRelationships: [mappedRelationships.SUBSCRIPTION_USES_LOCATION],
    dependsOn: [STEP_AD_ACCOUNT, steps.SUBSCRIPTION],
    executionHandler: fetchLocations,
    rolePermissions: ['Microsoft.Resources/subscriptions/locations/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.SUBSCRIPTIONS,
  },
];
