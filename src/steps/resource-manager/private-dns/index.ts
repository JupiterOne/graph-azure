import {
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
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
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
export * from './constants';

export async function fetchPrivateZones(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
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

export const privateDnsSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_PRIVATE_DNS_ZONES,
    name: 'Private DNS Zones',
    entities: [PrivateDnsEntities.ZONE],
    relationships: [PrivateDnsRelationships.RESOURCE_GROUP_HAS_ZONE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchPrivateZones,
  },
  {
    id: STEP_RM_PRIVATE_DNS_RECORD_SETS,
    name: 'Private DNS Record Sets',
    entities: [PrivateDnsEntities.RECORD_SET],
    relationships: [PrivateDnsRelationships.ZONE_HAS_RECORD_SET],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_PRIVATE_DNS_ZONES],
    executionHandler: fetchPrivateRecordSets,
  },
];
