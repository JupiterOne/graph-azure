import { FrontDoor } from '@azure/arm-frontdoor/esm/models';
import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import { FrontDoorEntities } from './constants';

export function createFrontDoorEntity(
  webLinker: AzureWebLinker,
  frontdoor: FrontDoor,
) {
  return createIntegrationEntity({
    entityData: {
      source: frontdoor,
      assign: {
        _key: frontdoor.id!,
        _type: FrontDoorEntities.FRONTDOOR._type,
        _class: FrontDoorEntities.FRONTDOOR._class,
        category: ['infrastructure'],
        function: ['content-distribution'],
        id: frontdoor.id,
        name: frontdoor.name,
        location: frontdoor.location,
        type: frontdoor.type,
        frontdoorId: frontdoor.frontdoorId,
        cname: frontdoor.cname,
        enabledState: frontdoor.enabledState,
        friendlyName: frontdoor.friendlyName,
        provisioningState: frontdoor.provisioningState,
        resourceState: frontdoor.resourceState,
        'backendPoolSettings.enforceCertificateNameCheck':
          frontdoor.backendPoolsSettings?.enforceCertificateNameCheck,
        'backendPoolSettings.sendRecvTimeoutSeconds':
          frontdoor.backendPoolsSettings?.sendRecvTimeoutSeconds,
      },
    },
  });
}
