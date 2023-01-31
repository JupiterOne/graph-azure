import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { CdnClient } from './client';
import {
  CdnEntities,
  CdnRelationships,
  STEP_RM_CDN_PROFILE,
  STEP_RM_CDN_ENDPOINTS,
} from './constants';
import { createCdnProfileEntity, createCdnEndpointEntity } from './converters';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';

export async function fetchProfiles(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new CdnClient(instance.config, logger);

  await client.iterateProfiles(async (profile) => {
    const profileEntity = createCdnProfileEntity(webLinker, profile);
    await jobState.addEntity(profileEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      profileEntity,
    );

    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      executionContext,
      profileEntity,
    );
  });
}

export async function fetchEndpoints(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new CdnClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: CdnEntities.PROFILE._type },
    async (profileEntity) => {
      await client.iterateEndpoints(
        (profileEntity as unknown) as { name: string; id: string },
        async (cdnEndpoint) => {
          const cdnEndpointEntity = createCdnEndpointEntity(
            webLinker,
            cdnEndpoint,
          );
          await jobState.addEntity(cdnEndpointEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: profileEntity,
              to: cdnEndpointEntity,
            }),
          );

          await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
            executionContext,
            cdnEndpointEntity,
          );
        },
      );
    },
  );
}

export const cdnSteps: AzureIntegrationStep[] = [
  {
    id: STEP_RM_CDN_PROFILE,
    name: 'CDN Profiles',
    entities: [CdnEntities.PROFILE, ...diagnosticSettingsEntitiesForResource],
    relationships: [
      CdnRelationships.RESOURCE_GROUP_HAS_PROFILE,
      ...getDiagnosticSettingsRelationshipsForResource(CdnEntities.PROFILE),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchProfiles,
    rolePermissions: [
      'Microsoft.Cdn/profiles/read',
      'Microsoft.Insights/DiagnosticSettings/Read',
    ],
  },
  {
    id: STEP_RM_CDN_ENDPOINTS,
    name: 'CDN Endpoints',
    entities: [CdnEntities.ENDPOINT, ...diagnosticSettingsEntitiesForResource],
    relationships: [
      CdnRelationships.PROFILE_HAS_ENDPOINT,
      ...getDiagnosticSettingsRelationshipsForResource(CdnEntities.ENDPOINT),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_CDN_PROFILE],
    executionHandler: fetchEndpoints,
    rolePermissions: [
      'Microsoft.Cdn/profiles/endpoints/read',
      'Microsoft.Insights/DiagnosticSettings/Read',
    ],
  },
];
