import map from 'lodash.map';

import {
  FrontendIPConfiguration,
  IPConfiguration,
  LoadBalancer,
  NetworkInterface,
  NetworkSecurityGroup,
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
import {
  LOAD_BALANCER_ENTITY_CLASS,
  LOAD_BALANCER_ENTITY_TYPE,
  NETWORK_INTERFACE_ENTITY_CLASS,
  NETWORK_INTERFACE_ENTITY_TYPE,
  PUBLIC_IP_ADDRESS_ENTITY_CLASS,
  PUBLIC_IP_ADDRESS_ENTITY_TYPE,
  SECURITY_GROUP_ENTITY_CLASS,
  SECURITY_GROUP_ENTITY_TYPE,
  SUBNET_ENTITY_CLASS,
  SUBNET_ENTITY_TYPE,
  VIRTUAL_NETWORK_ENTITY_CLASS,
  VIRTUAL_NETWORK_ENTITY_TYPE,
} from '../constants';
import isWideOpenSecurityGroup from './isWideOpenSecurityGroup';

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
        _type: LOAD_BALANCER_ENTITY_TYPE,
        _class: LOAD_BALANCER_ENTITY_CLASS,
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
    _type: NETWORK_INTERFACE_ENTITY_TYPE,
    _class: NETWORK_INTERFACE_ENTITY_CLASS,
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
    _type: PUBLIC_IP_ADDRESS_ENTITY_TYPE,
    _class: PUBLIC_IP_ADDRESS_ENTITY_CLASS,
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
        _type: SUBNET_ENTITY_TYPE,
        _class: SUBNET_ENTITY_CLASS,
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
        _type: SECURITY_GROUP_ENTITY_TYPE,
        _class: SECURITY_GROUP_ENTITY_CLASS,
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
        _type: VIRTUAL_NETWORK_ENTITY_TYPE,
        _class: VIRTUAL_NETWORK_ENTITY_CLASS,
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

export function createLoadBalancerBackendNicRelationship(
  lb: LoadBalancer,
  nicId: string,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.CONNECTS,
    fromKey: lb.id as string,
    fromType: LOAD_BALANCER_ENTITY_TYPE,
    toKey: nicId,
    toType: NETWORK_INTERFACE_ENTITY_TYPE,
  });
}

export function createNetworkSecurityGroupNicRelationship(
  securityGroup: NetworkSecurityGroup,
  nic: NetworkInterface,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.PROTECTS,
    fromKey: securityGroup.id as string,
    fromType: SECURITY_GROUP_ENTITY_TYPE,
    toKey: nic.id as string,
    toType: NETWORK_INTERFACE_ENTITY_TYPE,
  });
}

export function createVirtualNetworkSubnetRelationship(
  vnet: VirtualNetwork,
  subnet: Subnet,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.CONTAINS,
    fromKey: vnet.id as string,
    fromType: VIRTUAL_NETWORK_ENTITY_TYPE,
    toKey: subnet.id as string,
    toType: SUBNET_ENTITY_TYPE,
  });
}

export function createNetworkSecurityGroupSubnetRelationship(
  securityGroup: NetworkSecurityGroup,
  subnet: Subnet,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.PROTECTS,
    fromKey: securityGroup.id as string,
    fromType: SECURITY_GROUP_ENTITY_TYPE,
    toKey: subnet.id as string,
    toType: SUBNET_ENTITY_TYPE,
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
