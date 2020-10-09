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
} from '@azure/arm-security/esm/models';

export function createAssessmentEntity(
  webLinker: AzureWebLinker,
  data: SecurityAssessment,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: SecurityEntities.ASSESSMENT._type,
        _class: SecurityEntities.ASSESSMENT._class,
        id: data.id,
        name: data.name,
        displayName: data.displayName,
        category: 'Security Assessment',
        summary: data.displayName,
        internal: true,
        type: data.type,
        statusCode: data.status.code,
        statusCause: data.status.cause,
        statusDescription: data.status.description,
        // typescript typings are wrong, these properties use capital letters
        // testing both in case this is remediated in the API in the future.
        resourceDetailsSource:
          data.resourceDetails.source || (data.resourceDetails as any).Source,
        resourceDetailsId:
          (data.resourceDetails as AzureResourceDetails).id ||
          (data.resourceDetails as any).Id,

        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}