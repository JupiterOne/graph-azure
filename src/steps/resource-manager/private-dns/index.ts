import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { J1PrivateDnsManagementClient } from './client';
import {
  PrivateDnsEntities,
  PrivateDnsRelationships,
  STEP_RM_PRIVATE_DNS_ZONES,
  STEP_RM_PRIVATE_DNS_RECORD_SETS,
} from './constants';
import {
  createPrivateDnsZoneEntity,
  createPrivateDnsRecordSetEntity,
} from './converters';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import { ResourcesClient } from '../resources/client';

export async function fetchPrivateZones(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const resourceClient = new ResourcesClient(instance.config, logger);
  const { registrationState } = await resourceClient.getResourceProvider(
    'Microsoft.Network',
  );
  if (registrationState !== 'Registered') {
    logger.info(
      {
        registrationState,
        subscriptionId: instance.config.subscriptionId,
      },
      'Registration state !== "Registered"',
    );
    return;
  }
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1PrivateDnsManagementClient(instance.config, logger);

  await client.iteratePrivateDnsZones(async (zone) => {
    const dnsZoneEntity = createPrivateDnsZoneEntity(webLinker, zone);
    await jobState.addEntity(dnsZoneEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      dnsZoneEntity,
    );
  });
}

export async function fetchPrivateRecordSets(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1PrivateDnsManagementClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: PrivateDnsEntities.ZONE._type },
    async (dnsZoneEntity) => {
      await client.iteratePrivateDnsRecordSets(
        (dnsZoneEntity as unknown) as { name: string; id: string },
        async (recordSet) => {
          const recordSetEntity = createPrivateDnsRecordSetEntity(
            webLinker,
            recordSet,
          );
          await jobState.addEntity(recordSetEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: dnsZoneEntity,
              to: recordSetEntity,
            }),
          );
        },
      );
    },
  );
}

export const privateDnsSteps: AzureIntegrationStep[] = [
  {
    id: STEP_RM_PRIVATE_DNS_ZONES,
    name: 'Private DNS Zones',
    entities: [PrivateDnsEntities.ZONE],
    relationships: [PrivateDnsRelationships.RESOURCE_GROUP_HAS_ZONE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchPrivateZones,
    permissions: ['Microsoft.Network/privateDnsZones/read'],
  },
  {
    id: STEP_RM_PRIVATE_DNS_RECORD_SETS,
    name: 'Private DNS Record Sets',
    entities: [PrivateDnsEntities.RECORD_SET],
    relationships: [PrivateDnsRelationships.ZONE_HAS_RECORD_SET],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_PRIVATE_DNS_ZONES],
    executionHandler: fetchPrivateRecordSets,
    permissions: ['Microsoft.Network/privateDnsZones/recordsets/read'],
  },
];
