import map from 'lodash.map';

import {
  AzureFirewall,
  FlowLog,
  FrontendIPConfiguration,
  IPConfiguration,
  LoadBalancer,
  NetworkInterface,
  NetworkSecurityGroup,
  NetworkWatcher,
  PublicIPAddress,
  Subnet,
  VirtualNetwork,
} from '@azure/arm-network/esm/models';
import {
  assignTags,
  createIntegrationEntity,
  createDirectRelationship,
  Entity,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { AzureWebLinker } from '../../../../azure';
import { resourceGroupName } from '../../../../azure/utils';
import { NetworkEntities } from '../constants';
import isWideOpenSecurityGroup from './isWideOpenSecurityGroup';
import flatten from '../../utils/flatten';

export * from './securityGroups';

export function createLoadBalancerEntity(
  webLinker: AzureWebLinker,
  data: LoadBalancer,
): Entity {
  const publicIp = publicIpAddresses(data.frontendIPConfigurations);
  const privateIp = privateIpAddresses(data.frontendIPConfigurations);

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: NetworkEntities.LOAD_BALANCER._type,
        _class: NetworkEntities.LOAD_BALANCER._class,
        category: ['network'],
        function: ['load-balancing'],
        resourceGuid: data.resourceGuid,
        resourceGroup: resourceGroupName(data.id),
        displayName: data.name,
        type: data.type,
        region: data.location,
        publicIp,
        privateIp,
        public: publicIp.length > 0,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createNetworkInterfaceEntity(
  webLinker: AzureWebLinker,
  data: NetworkInterface,
  publicIps: string[] | undefined,
): Entity {
  const privateIps = privateIpAddresses(data.ipConfigurations);

  const entity = {
    _key: data.id as string,
    _type: NetworkEntities.NETWORK_INTERFACE._type,
    _class: NetworkEntities.NETWORK_INTERFACE._class,
    _rawData: [{ name: 'default', rawData: data }],
    id: data.id,
    resourceGuid: data.resourceGuid,
    resourceGroup: resourceGroupName(data.id),
    displayName: data.name,
    virtualMachineId: data.virtualMachine && data.virtualMachine.id,
    type: data.type,
    region: data.location,
    publicIp: publicIps,
    publicIpAddress: publicIps,
    privateIp: privateIps,
    privateIpAddress: privateIps,
    macAddress: data.macAddress,
    securityGroupId: data.networkSecurityGroup && data.networkSecurityGroup.id,
    ipForwarding: data.enableIPForwarding,
    webLink: webLinker.portalResourceUrl(data.id),
  };

  assignTags(entity, data.tags);

  return entity;
}

export function createPublicIPAddressEntity(
  webLinker: AzureWebLinker,
  data: PublicIPAddress,
): Entity {
  const entity = {
    _key: data.id as string,
    _type: NetworkEntities.PUBLIC_IP_ADDRESS._type,
    _class: NetworkEntities.PUBLIC_IP_ADDRESS._class,
    _rawData: [{ name: 'default', rawData: data }],
    id: data.id,
    resourceGuid: data.resourceGuid,
    resourceGroup: resourceGroupName(data.id),
    displayName: data.name,
    type: data.type,
    region: data.location,
    publicIp: data.ipAddress,
    publicIpAddress: data.ipAddress,
    public: true,
    webLink: webLinker.portalResourceUrl(data.id),
    sku: data.sku && data.sku.name,
  };

  assignTags(entity, data.tags);

  return entity;
}

export function createSubnetEntity(
  webLinker: AzureWebLinker,
  vnet: VirtualNetwork,
  data: Subnet,
): Entity {
  const CIDR = data.addressPrefix as string;

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: NetworkEntities.SUBNET._type,
        _class: NetworkEntities.SUBNET._class,
        displayName: `${data.name} (${CIDR})`,
        webLink: webLinker.portalResourceUrl(data.id),
        CIDR,
        public: false,
        internal: true,
        region: vnet.location,
        resourceGroup: resourceGroupName(data.id),
        environment: vnet.tags && vnet.tags['environment'],
      },
    },
  });
}

export function createNetworkSecurityGroupEntity(
  webLinker: AzureWebLinker,
  data: NetworkSecurityGroup,
): Entity {
  const category: string[] = [];
  if (data.subnets && data.subnets.length > 0) {
    category.push('network');
  }
  if (data.networkInterfaces && data.networkInterfaces.length > 0) {
    category.push('host');
  }

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: NetworkEntities.SECURITY_GROUP._type,
        _class: NetworkEntities.SECURITY_GROUP._class,
        webLink: webLinker.portalResourceUrl(data.id),
        region: data.location,
        resourceGroup: resourceGroupName(data.id),
        category,
        isWideOpen: isWideOpenSecurityGroup(data),
      },
      tagProperties: ['environment'],
    },
  });
}

export function createAzureFirewallEntity(
  webLinker: AzureWebLinker,
  data: AzureFirewall,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        id: data.id,
        _key: data.id,
        _type: NetworkEntities.AZURE_FIREWALL._type,
        _class: NetworkEntities.AZURE_FIREWALL._class,
        displayName: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
        category: ['network'],
        region: data.location,
        name: data.name,
        ...(data.additionalProperties &&
          flatten({ additionalProperties: data.additionalProperties })),
        ...(data.virtualHub && flatten({ virtualHub: data.virtualHub })),
        ...(data.firewallPolicy &&
          flatten({ firewallPolicy: data.firewallPolicy })),
        ...(data.managementIpConfiguration &&
          flatten({
            managementIpConfiguration: data.managementIpConfiguration,
          })),
        // TODO: add the following arrays of objects to the entity after we decide how to put them on the entity
        // applicationRuleCollections: [], // array of objects
        // natRuleCollections: [], // array of objects
        // networkRuleCollections: [], // array of objects
        // ipConfigurations: [], // array of objects
        // ipGroups: [], // array of objects
        // hubIpAddresses: [], //array of objects
        provisioningState: data.provisioningState,
        threatIntelMode: data.threatIntelMode,
        type: data.type,
        ...(data.zones && { zones: data.zones }),
      },
    },
  });
}

export function createVirtualNetworkEntity(
  webLinker: AzureWebLinker,
  data: VirtualNetwork,
): Entity {
  const CIDR =
    data.addressSpace &&
    data.addressSpace.addressPrefixes &&
    data.addressSpace.addressPrefixes.length > 0 &&
    data.addressSpace.addressPrefixes[0];

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: NetworkEntities.VIRTUAL_NETWORK._type,
        _class: NetworkEntities.VIRTUAL_NETWORK._class,
        displayName: `${data.name} (${CIDR})`,
        webLink: webLinker.portalResourceUrl(data.id),
        CIDR,
        public: false,
        internal: true,
        region: data.location,
        resourceGroup: resourceGroupName(data.id),
      },
      tagProperties: ['environment'],
    },
  });
}

export function createNetworkWatcherEntity(
  webLinker: AzureWebLinker,
  data: NetworkWatcher,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: NetworkEntities.NETWORK_WATCHER._type,
        _class: NetworkEntities.NETWORK_WATCHER._class,
        _key: data.id,
        id: data.id,
        name: data.name,
        type: data.type,
        location: data.location,
        provisioningState: data.provisioningState,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createNsgFlowLogEntity(
  webLinker: AzureWebLinker,
  data: FlowLog,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: NetworkEntities.SECURITY_GROUP_FLOW_LOGS._type,
        _class: NetworkEntities.SECURITY_GROUP_FLOW_LOGS._class,
        _key: data.id,
        id: data.id,
        name: data.name,
        type: data.type,
        location: data.location,
        targetResourceId: data.targetResourceId,
        storageId: data.storageId,
        enabled: data.enabled,
        'retentionPolicy.enabled': data.retentionPolicy?.enabled,
        'retentionPolicy.days': data.retentionPolicy?.days,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}

export function createLoadBalancerBackendNicRelationship(
  lb: LoadBalancer,
  nicId: string,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.CONNECTS,
    fromKey: lb.id as string,
    fromType: NetworkEntities.LOAD_BALANCER._type,
    toKey: nicId,
    toType: NetworkEntities.NETWORK_INTERFACE._type,
  });
}

export function createNetworkSecurityGroupNicRelationship(
  securityGroup: NetworkSecurityGroup,
  nic: NetworkInterface,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.PROTECTS,
    fromKey: securityGroup.id as string,
    fromType: NetworkEntities.SECURITY_GROUP._type,
    toKey: nic.id as string,
    toType: NetworkEntities.NETWORK_INTERFACE._type,
  });
}

export function createVirtualNetworkSubnetRelationship(
  vnet: VirtualNetwork,
  subnet: Subnet,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.CONTAINS,
    fromKey: vnet.id as string,
    fromType: NetworkEntities.VIRTUAL_NETWORK._type,
    toKey: subnet.id as string,
    toType: NetworkEntities.SUBNET._type,
  });
}

export function createNetworkSecurityGroupSubnetRelationship(
  securityGroup: NetworkSecurityGroup,
  subnet: Subnet,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.PROTECTS,
    fromKey: securityGroup.id as string,
    fromType: NetworkEntities.SECURITY_GROUP._type,
    toKey: subnet.id as string,
    toType: NetworkEntities.SUBNET._type,
  });
}

function publicIpAddresses(
  ipConfigurations: IPConfiguration[] | FrontendIPConfiguration[] | undefined,
): string[] {
  const configs =
    ipConfigurations && ipConfigurations.filter((c) => c.publicIPAddress);
  return map(
    configs,
    (a) => a.publicIPAddress && a.publicIPAddress.ipAddress,
  ) as string[];
}

function privateIpAddresses(
  ipConfigurations: IPConfiguration[] | FrontendIPConfiguration[] | undefined,
): string[] {
  const configs =
    ipConfigurations && ipConfigurations.filter((c) => c.privateIPAddress);
  return map(configs, (a) => a.privateIPAddress) as string[];
}
