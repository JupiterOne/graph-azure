import {
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { J1DnsManagementClient } from './client';
import {
  DnsEntities,
  DnsRelationships,
  STEP_RM_DNS_ZONES,
  STEP_RM_DNS_RECORD_SETS,
} from './constants';
import { createDnsZoneEntity, createDnsRecordSetEntity } from './converters';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
export * from './constants';

export async function fetchZones(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1DnsManagementClient(instance.config, logger);

  await client.iterateDnsZones(async (zone) => {
    const dnsZoneEntity = createDnsZoneEntity(webLinker, zone);
    await jobState.addEntity(dnsZoneEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      dnsZoneEntity,
    );
  });
}

export async function fetchRecordSets(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1DnsManagementClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: DnsEntities.ZONE._type },
    async (dnsZoneEntity) => {
      await client.iterateDnsRecordSets(
        (dnsZoneEntity as unknown) as { name: string; id: string },
        async (recordSet) => {
          const recordSetEntity = createDnsRecordSetEntity(
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

export const dnsSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_DNS_ZONES,
    name: 'DNS Zones',
    entities: [DnsEntities.ZONE],
    relationships: [DnsRelationships.RESOURCE_GROUP_HAS_ZONE],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchZones,
  },
  {
    id: STEP_RM_DNS_RECORD_SETS,
    name: 'DNS Record Sets',
    entities: [DnsEntities.RECORD_SET],
    relationships: [DnsRelationships.ZONE_HAS_RECORD_SET],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_DNS_ZONES],
    executionHandler: fetchRecordSets,
  },
];
