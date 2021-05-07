import {
  Step,
  IntegrationStepExecutionContext,
  StepEntityMetadata,
  IntegrationLogger,
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
import { createAppEntity } from './converters';
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
    const metadata = getMetadataForApp(logger, app);
    const appEntity = await jobState.addEntity(
      createAppEntity(webLinker, app, metadata),
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
];
