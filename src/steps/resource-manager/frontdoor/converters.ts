import { FrontDoor, RulesEngine } from '@azure/arm-frontdoor/esm/models';
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

export function createRulesEngineEntity(
  webLinker: AzureWebLinker,
  rulesEngine: RulesEngine,
) {
  return createIntegrationEntity({
    entityData: {
      source: rulesEngine,
      assign: {
        _key: rulesEngine.id!,
        _type: FrontDoorEntities.RULES_ENGINE._type,
        _class: FrontDoorEntities.RULES_ENGINE._class,
        id: rulesEngine.id,
        name: rulesEngine.name,
        resourceState: rulesEngine.resourceState,
        ruleCount: rulesEngine.rules?.length,
        type: rulesEngine.type,
      },
    },
  });
}
