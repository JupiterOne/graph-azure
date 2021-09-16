import {
  Entity,
  createIntegrationEntity,
  StepEntityMetadata,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import {
  AppServicePlan,
  Site,
  WebAppsGetAuthSettingsResponse,
  WebAppsGetConfigurationResponse,
} from '@azure/arm-appservice/esm/models';
import { AppServiceEntities } from './constants';

export function createAppEntity({
  webLinker,
  data,
  metadata,
  appConfig,
  appAuthSettings,
}: {
  webLinker: AzureWebLinker;
  data: Site;
  metadata: StepEntityMetadata;
  appConfig: WebAppsGetConfigurationResponse | null;
  appAuthSettings: WebAppsGetAuthSettingsResponse | null;
}): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: metadata._type,
        _class: metadata._class,
        id: data.id,
        name: data.name,
        type: data.type,
        kind: data.kind?.split(','),
        location: data.location,
        // 9.1 Ensure App Service Authentication is set on Azure App Service (Automated)
        authEnabled: appAuthSettings?.enabled,
        // 9.2 Ensure web app redirects all HTTP traffic to HTTPS in Azure App Service (Automated)
        httpsOnly: data.httpsOnly,
        // 9.3 Ensure web app is using the latest version of TLS encryption (Automated)
        minTlsVersion: appConfig?.minTlsVersion,
        // 9.4 Ensure the web app has 'Client Certificates (Incoming client certificates)' set to 'On' (Automated)
        clientCertEnabled: data.clientCertEnabled,
        // 9.5 Ensure that Register with Azure Active Directory is enabled on App Service (Automated)
        principalId: data.identity?.principalId,
        // 9.6 Ensure that 'PHP version' is the latest, if used to run the web app (Manual)
        phpVersion: appConfig?.phpVersion,
        // 9.7 Ensure that 'Python version' is the latest, if used to run the web app (Manual)
        pythonVersion: appConfig?.pythonVersion,
        // 9.8 Ensure that 'Java version' is the latest, if used to run the web app (Manual)
        javaVersion: appConfig?.javaVersion,
        // Not CIS benchmark, but useful property
        nodeVersion: appConfig?.nodeVersion,
        // 9.9 Ensure that 'HTTP Version' is the latest, if used to run the web app (Manual)
        http20Enabled: appConfig?.http20Enabled,
        // 9.10 Ensure FTP deployments are disabled (Automated)
        ftpsState: appConfig?.ftpsState,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createAppServicePlanEntity(
  webLinker: AzureWebLinker,
  data: AppServicePlan,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: AppServiceEntities.APP_SERVICE_PLAN._type,
        _class: AppServiceEntities.APP_SERVICE_PLAN._class,
        id: data.id,
        name: data.name,
        type: data.type,
        kind: data.kind?.split(','),
        location: data.location,
        'sku.name': data.sku?.name,
        'sku.tier': data.sku?.tier,
        'sku.size': data.sku?.size,
        'sku.family': data.sku?.family,
        'sku.capacity': data.sku?.capacity,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
