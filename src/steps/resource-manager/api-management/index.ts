import {
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
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
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
export * from './constants';

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
        (serviceEntity as unknown) as { name: string; id: string },
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

export const apiManagementSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
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
        ApiManagementEntities.SERVICE._type,
      ),
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchApiManagementServices,
  },
  {
    id: STEP_RM_API_MANAGEMENT_APIS,
    name: 'API Management APIs',
    entities: [ApiManagementEntities.API],
    relationships: [ApiManagementRelationships.SERVICE_HAS_API],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_API_MANAGEMENT_SERVICES],
    executionHandler: fetchApiManagementApis,
  },
];
