import {
  BackendPool,
  ForwardingConfiguration,
  FrontDoor,
  FrontendEndpoint,
  RedirectConfiguration,
  RoutingRule,
  RulesEngine,
} from '@azure/arm-frontdoor/esm/models';
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

export function createRoutingRuleEntity(
  webLinker: AzureWebLinker,
  routingRule: RoutingRule,
) {
  const frontendEndpoints: string[] = [];
  for (const frontendEndpoint of routingRule.frontendEndpoints || []) {
    if (frontendEndpoint.id) frontendEndpoints.push(frontendEndpoint.id);
  }
  return createIntegrationEntity({
    entityData: {
      source: routingRule,
      assign: {
        _key: routingRule.id!,
        _type: FrontDoorEntities.ROUTING_RULE._type,
        _class: FrontDoorEntities.ROUTING_RULE._class,
        id: routingRule.id,
        name: routingRule.name,
        type: routingRule.type,
        enabledState: routingRule.enabledState,
        acceptedProtocols: routingRule.acceptedProtocols,
        frontendEndpoints,
        patternsToMatch: routingRule.patternsToMatch,
        resourceState: routingRule.resourceState,
        'routeConfiguration.odatatype':
          routingRule.routeConfiguration?.odatatype,
        // if ForwardingConfiguration
        'routeConfiguration.customForwardingPath': (
          routingRule.routeConfiguration as ForwardingConfiguration | undefined
        )?.customForwardingPath,
        'routeConfiguration.forwardingProtocol': (
          routingRule.routeConfiguration as ForwardingConfiguration | undefined
        )?.forwardingProtocol,
        'routeConfiguration.cacheConfiguration.cacheDuration': (
          routingRule.routeConfiguration as ForwardingConfiguration | undefined
        )?.cacheConfiguration?.cacheDuration,
        'routeConfiguration.cacheConfiguration.dynamicCompression': (
          routingRule.routeConfiguration as ForwardingConfiguration | undefined
        )?.cacheConfiguration?.dynamicCompression,
        'routeConfiguration.cacheConfiguration.queryParameterStripDirective': (
          routingRule.routeConfiguration as ForwardingConfiguration | undefined
        )?.cacheConfiguration?.queryParameterStripDirective,
        'routeConfiguration.cacheConfiguration.queryParameters': (
          routingRule.routeConfiguration as ForwardingConfiguration | undefined
        )?.cacheConfiguration?.queryParameters,
        'routeConfiguration.cacheConfiguration.backendPoolId': (
          routingRule.routeConfiguration as ForwardingConfiguration | undefined
        )?.backendPool?.id,
        // if RedirectConfiguration
        'routeConfiguration.customFragment': (
          routingRule.routeConfiguration as RedirectConfiguration | undefined
        )?.customFragment,
        'routeConfiguration.customHost': (
          routingRule.routeConfiguration as RedirectConfiguration | undefined
        )?.customHost,
        'routeConfiguration.customPath': (
          routingRule.routeConfiguration as RedirectConfiguration | undefined
        )?.customPath,
        'routeConfiguration.customQueryString': (
          routingRule.routeConfiguration as RedirectConfiguration | undefined
        )?.customQueryString,
        'routeConfiguration.redirectProtocol': (
          routingRule.routeConfiguration as RedirectConfiguration | undefined
        )?.redirectProtocol,
        'routeConfiguration.redirectType': (
          routingRule.routeConfiguration as RedirectConfiguration | undefined
        )?.redirectType,
        rulesEngineId: routingRule.rulesEngine?.id,
      },
    },
  });
}

export function createBackendPoolEntity(
  webLinker: AzureWebLinker,
  backendPool: BackendPool,
) {
  return createIntegrationEntity({
    entityData: {
      source: backendPool,
      assign: {
        _key: backendPool.id!,
        _type: FrontDoorEntities.BACKEND_POOL._type,
        _class: FrontDoorEntities.BACKEND_POOL._class,
        id: backendPool.id,
        name: backendPool.name,
        type: backendPool.type,
        resourceState: backendPool.resourceState,
        loadBalancingSettingsId: backendPool.loadBalancingSettings?.id,
        healthProbeSettingsId: backendPool.healthProbeSettings?.id,
      },
    },
  });
}

export function createFrontendEndpointEntity(
  webLinker: AzureWebLinker,
  frontendEndpoint: FrontendEndpoint,
) {
  return createIntegrationEntity({
    entityData: {
      source: frontendEndpoint,
      assign: {
        _key: frontendEndpoint.id!,
        _type: FrontDoorEntities.FRONTEND_ENDPOINT._type,
        _class: FrontDoorEntities.FRONTEND_ENDPOINT._class,
        category: ['data'],
        function: ['content-distribution'],
        public: true,
        id: frontendEndpoint.id,
        name: frontendEndpoint.name,
        type: frontendEndpoint.type,
        resourceState: frontendEndpoint.resourceState,
        hostName: frontendEndpoint.hostName,
        customHttpsProvisioningState:
          frontendEndpoint.customHttpsProvisioningState,
        customHttpsProvisioningSubstate:
          frontendEndpoint.customHttpsProvisioningSubstate,
        sessionAffinityEnabledState:
          frontendEndpoint.sessionAffinityEnabledState,
        sessionAffinityTtlSeconds: frontendEndpoint.sessionAffinityTtlSeconds,
        'customHttpsConfiguration.certificateSource':
          frontendEndpoint.customHttpsConfiguration?.certificateSource,
        'customHttpsConfiguration.certificateType':
          frontendEndpoint.customHttpsConfiguration?.certificateType,
        'customHttpsConfiguration.minimumTlsVersion':
          frontendEndpoint.customHttpsConfiguration?.minimumTlsVersion,
        'customHttpsConfiguration.secretName':
          frontendEndpoint.customHttpsConfiguration?.secretName,
        'customHttpsConfiguration.secretVersion':
          frontendEndpoint.customHttpsConfiguration?.secretVersion,
        'customHttpsConfiguration.vaultId':
          frontendEndpoint.customHttpsConfiguration?.vault?.id,
        webApplicationFirewallPolicyLinkId:
          frontendEndpoint.webApplicationFirewallPolicyLink?.id,
      },
    },
  });
}
