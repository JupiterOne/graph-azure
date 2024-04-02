import {
  StepEntityMetadata,
  IntegrationLogger,
  getRawData,
  createDirectRelationship,
  RelationshipClass,
  IntegrationWarnEventName,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { AppServiceClient } from './client';
import {
  AppServiceEntities,
  AppServiceRelationships,
  AppServiceSteps,
} from './constants';
import { createAppEntity, createAppServicePlanEntity } from './converters';
import {
  Site,
  WebAppsGetAuthSettingsResponse,
} from '@azure/arm-appservice/esm/models';
import createResourceGroupResourceRelationship from '../utils/createResourceGroupResourceRelationship';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import { INGESTION_SOURCE_IDS } from '../../../constants';

export async function fetchApps(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new AppServiceClient(instance.config, logger);

  let canFetchAppAuthConfiguration = true;

  await client.iterateApps(async (app) => {
    let appAuthSettings: WebAppsGetAuthSettingsResponse | undefined;

    const appConfig = await client.fetchAppConfiguration(
      app.name,
      app.resourceGroup,
    );

    if (canFetchAppAuthConfiguration) {
      try {
        appAuthSettings = await client.fetchAppAuthSettings(
          app.name,
          app.resourceGroup,
        );
      } catch (err) {
        logger.warn(
          {
            error: err.message,
            name: app.name,
            resourceGroup: app.resourceGroup,
          },
          'Warning: unable to fetch app configuration.',
        );
        if (err.statusCode === 403 && err.code === 'AuthorizationFailed') {
          logger.publishWarnEvent({
            name: IntegrationWarnEventName.MissingPermission,
            description:
              'Missing permission "Microsoft.Web/sites/config/list/action", which is used to fetch WebApp Auth Settings. Please update the `JupiterOne Reader` Role in your Azure environment in order to fetch these settings for your WebApp.',
          });
          canFetchAppAuthConfiguration = false;
        }
      }
    }

    const metadata = getMetadataForApp(logger, app);
    const appEntity = createAppEntity({
      webLinker,
      data: app,
      metadata,
      appConfig,
      appAuthSettings,
    });
    if (!jobState.hasKey(appEntity._key)) {
      await jobState.addEntity(appEntity);
      await createResourceGroupResourceRelationship(
        executionContext,
        appEntity,
      );
    } else {
      logger.info({ key: appEntity._key }, 'Found duplicated key');
    }
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

export const appServiceSteps: AzureIntegrationStep[] = [
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
    rolePermissions: [
      'Microsoft.Web/sites/Read',
      'Microsoft.Web/sites/config/Read',
      'Microsoft.Web/sites/config/list/action',
    ],
    ingestionSourceId: INGESTION_SOURCE_IDS.APPSERVICE,
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
    rolePermissions: ['Microsoft.Web/serverfarms/Read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.APPSERVICE,
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
    ingestionSourceId: INGESTION_SOURCE_IDS.APPSERVICE,
  },
];
