import {
  Step,
  IntegrationStepExecutionContext,
  StepEntityMetadata,
  IntegrationLogger,
  getRawData,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { AppServiceClient } from './client';
import {
  AppServiceEntities,
  AppServiceRelationships,
  AppServiceSteps,
} from './constants';
import { createAppEntity, createAppServicePlanEntity } from './converters';
import { Site } from '@azure/arm-appservice/esm/models';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';

export async function fetchApps(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AppServiceClient(instance.config, logger);

  await client.iterateApps(async (app) => {
    const appConfig = await client.fetchAppConfiguration(
      app.name,
      app.resourceGroup,
    );
    const appAuthSettings = await client.fetchAppAuthSettings(
      app.name,
      app.resourceGroup,
    );
    const metadata = getMetadataForApp(logger, app);
    const appEntity = await jobState.addEntity(
      createAppEntity({
        webLinker,
        data: app,
        metadata,
        appConfig,
        appAuthSettings,
      }),
    );
    await createResourceGroupResourceRelationship(executionContext, appEntity);
  });
}

/**
 * Apps are differentiated by `kind`, a comma-separated string.
 *
 * Function app example:
 * {
 *   "kind": "functionapp,linux",
 * }
 *
 * Web app example:
 * {
 *   "kind": "app,linux",
 * }
 */
function getMetadataForApp(
  logger: IntegrationLogger,
  app: Site,
): StepEntityMetadata {
  const kinds = app.kind?.split(',');

  if (kinds?.includes('functionapp')) {
    return AppServiceEntities.FUNCTION_APP;
  }

  if (kinds?.includes('app')) {
    return AppServiceEntities.WEB_APP;
  }

  logger.warn(
    {
      appId: app.id,
      appKind: app.kind,
    },
    `AppService: Unknown value for app.kind. Defaulting to ${AppServiceEntities.WEB_APP._type}`,
  );

  return AppServiceEntities.WEB_APP;
}

export async function fetchAppServicePlans(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AppServiceClient(instance.config, logger);

  await client.iterateAppServicePlans(async (appServicePlan) => {
    const appEntity = await jobState.addEntity(
      createAppServicePlanEntity(webLinker, appServicePlan),
    );
    await createResourceGroupResourceRelationship(executionContext, appEntity);
  });
}

export async function buildAppToPlanRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, jobState } = executionContext;

  for (const appEntityType of [
    AppServiceEntities.WEB_APP._type,
    AppServiceEntities.FUNCTION_APP._type,
  ]) {
    await jobState.iterateEntities(
      { _type: appEntityType },
      async (appEntity) => {
        const app = getRawData<Site>(appEntity);

        const appServicePlanId = app?.serverFarmId;
        const appServicePlanEntity = await jobState.findEntity(
          appServicePlanId!,
        );

        if (!appServicePlanEntity) {
          logger.warn(
            {
              appId: app?.id,
              appServicePlanId: app?.serverFarmId,
            },
            'Could not find app service plan in jobState.',
          );
          return;
        }

        await jobState.addRelationship(
          createDirectRelationship({
            from: appEntity,
            _class: RelationshipClass.USES,
            to: appServicePlanEntity,
          }),
        );
      },
    );
  }
}

export const appServiceSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: AppServiceSteps.APPS,
    name: 'App Service Apps',
    entities: [AppServiceEntities.WEB_APP, AppServiceEntities.FUNCTION_APP],
    relationships: [
      AppServiceRelationships.RESOURCE_GROUP_HAS_WEB_APP,
      AppServiceRelationships.RESOURCE_GROUP_HAS_FUNCTION_APP,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchApps,
  },
  {
    id: AppServiceSteps.APP_SERVICE_PLANS,
    name: 'App Service Plans',
    entities: [AppServiceEntities.APP_SERVICE_PLAN],
    relationships: [
      AppServiceRelationships.RESOURCE_GROUP_HAS_APP_SERVICE_PLAN,
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchAppServicePlans,
  },
  {
    id: AppServiceSteps.APP_TO_SERVICE_RELATIONSHIPS,
    name: 'App Service App to Plan Relationships',
    entities: [],
    relationships: [
      AppServiceRelationships.WEB_APP_USES_PLAN,
      AppServiceRelationships.FUNCTION_APP_USES_PLAN,
    ],
    dependsOn: [AppServiceSteps.APPS, AppServiceSteps.APP_SERVICE_PLANS],
    executionHandler: buildAppToPlanRelationships,
  },
];
