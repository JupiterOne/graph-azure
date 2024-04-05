import {
  Entity,
  createIntegrationEntity,
  convertProperties,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../azure';
import { SecurityEntities } from './constants';
import {
  SecurityAssessment,
  AzureResourceDetails,
  SecurityContact,
  Pricing,
  Setting,
  AutoProvisioningSetting,
  Alert,
} from '@azure/arm-security/esm/models';

function findSecurityAssessmentScannedResourceId(
  data: SecurityAssessment,
): string | undefined {
  // typescript typings are wrong, these properties use capital letters
  // testing both in case this is remediated in the API in the future.
  const source =
    data.resourceDetails.source || (data.resourceDetails as any).Source;
  if (source === 'Azure') {
    return (
      (data.resourceDetails as AzureResourceDetails).id ||
      (data.resourceDetails as any).Id
    );
  }
}

export function createAssessmentEntity(
  webLinker: AzureWebLinker,
  data: SecurityAssessment,
): Entity {
  const webLink = webLinker.portalResourceUrl(data.id);
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        ...convertProperties(data.metadata, { prefix: 'metadata' }),
        ...convertProperties(data.resourceDetails, {
          prefix: 'resourceDetails',
        }),
        _key: data.id as string,
        _type: SecurityEntities.ASSESSMENT._type,
        _class: SecurityEntities.ASSESSMENT._class,
        id: data.id,
        name: data.name,
        displayName: data.displayName,
        category: data.metadata?.category
          ? JSON.stringify(data.metadata.category)
          : 'Security Assessment',
        summary: data.displayName,
        internal: true,
        type: data.type,
        statusCode: data.status.code,
        statusCause: data.status.cause,
        statusDescription: data.status.description,
        scannedResourceId: findSecurityAssessmentScannedResourceId(data),
        webLink: webLink ? encodeURI(webLink) : webLink,
      },
    },
  });
}

export function createSecurityContactEntity(
  webLinker: AzureWebLinker,
  data: SecurityContact,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        id: data.id,
        webLink: webLinker.portalResourceUrl(data.id),
        _type: SecurityEntities.SECURITY_CENTER_CONTACT._type,
        _class: SecurityEntities.SECURITY_CENTER_CONTACT._class,
        email: data.email,
        phone: data.phone,
        alertNotifications: data.alertNotifications,
        alertsToAdmins: data.alertsToAdmins,
      },
    },
  });
}

export function createPricingConfigEntity(
  webLinker: AzureWebLinker,
  data: Pricing,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: SecurityEntities.SUBSCRIPTION_PRICING._type,
        _class: SecurityEntities.SUBSCRIPTION_PRICING._class,
        id: data.id,
        name: data.name,
        type: data.type,
        pricingTier: data.pricingTier,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createSecurityCenterSettingEntity(
  webLinker: AzureWebLinker,
  data: Setting,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: SecurityEntities.SETTING._type,
        _class: SecurityEntities.SETTING._class,
        id: data.id,
        name: data.name,
        type: data.type,
        kind: data.kind,
        enabled: (data as any).properties?.enabled,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createSecurityCenterAutoProvisioningSettingEntity(
  webLinker: AzureWebLinker,
  data: AutoProvisioningSetting,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: SecurityEntities.AUTO_PROVISIONING_SETTING._type,
        _class: SecurityEntities.AUTO_PROVISIONING_SETTING._class,
        id: data.id,
        name: data.name,
        type: data.type,
        autoProvision: data.autoProvision,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createDefenderAlertEntity(
  webLinker: AzureWebLinker,
  data: Alert,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: SecurityEntities.DEFENDER_ALERT._type,
        _class: SecurityEntities.DEFENDER_ALERT._class,
        id: data.id,
        name: data.alertName,
        type: data.type,
        open: data.state == 'Active' ? true : false,
        severity: data.reportedSeverity ?? 'unknown',
        category: data.compromisedEntity,
        blocking: !data.canBeInvestigated,
        production: !data.compromisedEntity?.startsWith('Sample'),
        public: false, //No alert should be public
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
