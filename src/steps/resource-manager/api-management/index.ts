import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { J1ApiManagementClient } from './client';
import {
  ApiManagementEntities,
  ApiManagementRelationships,
  STEP_RM_API_MANAGEMENT_SERVICES,
  STEP_RM_API_MANAGEMENT_APIS,
} from './constants';
import {
  createApiManagementServiceEntity,
  createApiManagementApiEntity,
} from './converters';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { steps as storageSteps } from '../storage/constants';

export async function fetchApiManagementServices(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1ApiManagementClient(instance.config, logger);

  await client.iterateApiManagementServices(async (service) => {
    const apiManagementServiceEntity = createApiManagementServiceEntity(
      webLinker,
      service,
    );
    await jobState.addEntity(apiManagementServiceEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      apiManagementServiceEntity,
    );

    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      executionContext,
      apiManagementServiceEntity,
    );
  });
}

export async function fetchApiManagementApis(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new J1ApiManagementClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: ApiManagementEntities.SERVICE._type },
    async (serviceEntity) => {
      await client.iterateApiManagementServiceApis(
        serviceEntity as unknown as { name: string; id: string },
        async (api) => {
          const apiEntity = createApiManagementApiEntity(webLinker, api);
          await jobState.addEntity(apiEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: serviceEntity,
              to: apiEntity,
            }),
          );
        },
      );
    },
  );
}

export const apiManagementSteps: AzureIntegrationStep[] = [
  {
    id: STEP_RM_API_MANAGEMENT_SERVICES,
    name: 'API Management Services',
    entities: [
      ApiManagementEntities.SERVICE,
      ...diagnosticSettingsEntitiesForResource,
    ],
    relationships: [
      ApiManagementRelationships.RESOURCE_GROUP_HAS_SERVICE,
      ...getDiagnosticSettingsRelationshipsForResource(
        ApiManagementEntities.SERVICE,
      ),
    ],
    dependsOn: [
      STEP_AD_ACCOUNT,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      storageSteps.STORAGE_ACCOUNTS,
    ],
    executionHandler: fetchApiManagementServices,
    rolePermissions: [
      'Microsoft.ApiManagement/service/read',
      'Microsoft.Insights/DiagnosticSettings/Read',
    ],
    ingestionSourceId: INGESTION_SOURCE_IDS.API_MANAGEMENT,
  },
  {
    id: STEP_RM_API_MANAGEMENT_APIS,
    name: 'API Management APIs',
    entities: [ApiManagementEntities.API],
    relationships: [ApiManagementRelationships.SERVICE_HAS_API],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_API_MANAGEMENT_SERVICES],
    executionHandler: fetchApiManagementApis,
    rolePermissions: ['Microsoft.ApiManagement/service/apis/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.API_MANAGEMENT,
  },
];
