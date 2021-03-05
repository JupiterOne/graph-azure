import map from 'lodash.map';

import {
  convertProperties,
  createIntegrationEntity,
  createDirectRelationship,
  Entity,
  getTime,
  IntegrationInstance,
  Relationship,
  RelationshipDirection,
  assignTags,
  createMappedRelationship,
  setRawData,
} from '@jupiterone/integration-sdk-core';
import { Group, Organization, User } from '@microsoft/microsoft-graph-types';

import {
  generateEntityKey,
  generateRelationshipKey,
} from '../../utils/generateKeys';
import {
  GroupMember,
  MemberType,
  IdentitySecurityDefaultsEnforcementPolicy,
} from './client';
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GROUP_MEMBER_ENTITY_CLASS,
  GROUP_MEMBER_ENTITY_TYPE,
  GROUP_MEMBER_RELATIONSHIP_TYPE,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  SERVICE_PRINCIPAL_ENTITY_CLASS,
  SERVICE_PRINCIPAL_ENTITY_TYPE,
} from './constants';
import { RelationshipClass } from '@jupiterone/integration-sdk-core';

export function createAccountEntity(instance: IntegrationInstance): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _class: ACCOUNT_ENTITY_CLASS,
        _key: generateEntityKey(instance.id),
        _type: ACCOUNT_ENTITY_TYPE,
        name: instance.name,
        displayName: instance.name,
      },
    },
  });
}

export function createAccountEntityWithOrganization(
  instance: IntegrationInstance,
  organization: Organization,
  securityDefaults?: IdentitySecurityDefaultsEnforcementPolicy,
): Entity {
  let defaultDomain: string | undefined;
  const verifiedDomains = map(organization.verifiedDomains, (e) => {
    if (e.isDefault) {
      defaultDomain = e.name;
    }
    return e.name as string;
  });

  const accountEntityWithOrganization = createIntegrationEntity({
    entityData: {
      source: organization,
      assign: {
        _class: ACCOUNT_ENTITY_CLASS,
        _key: generateEntityKey(instance.id),
        _type: ACCOUNT_ENTITY_TYPE,
        name: organization.displayName,
        displayName: instance.name,
        organizationName: organization.displayName,
        defaultDomain,
        verifiedDomains,
        securityDefaultsEnabled: securityDefaults?.isEnabled,
      },
    },
  });

  if (securityDefaults) {
    setRawData(accountEntityWithOrganization, {
      name: 'identitySecurityDefaultsEnforcementPolicy',
      rawData: securityDefaults,
    });
  }
  return accountEntityWithOrganization;
}

export function createGroupEntity(data: Group): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data, { parseTime: true }),
        _key: generateEntityKey(data.id),
        _class: GROUP_ENTITY_CLASS,
        _type: GROUP_ENTITY_TYPE,
        name: data.displayName,
        deletedOn: getTime(data.deletedDateTime),
        createdOn: getTime(data.createdDateTime),
        email: data.mail ?? undefined,
        renewedOn: getTime(data.renewedDateTime),
      },
    },
  });
}

export function createUserEntity(data: User): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: generateEntityKey(data.id),
        _class: USER_ENTITY_CLASS,
        _type: USER_ENTITY_TYPE,
        name: data.displayName,
        email: data.mail ?? undefined,
        firstName: data.givenName,
        lastName: data.surname,
        username: data.userPrincipalName,
      },
    },
  });
}

export function createServicePrincipalEntity(data: any): Entity {
  const entity = createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: generateEntityKey(data.id),
        _class: SERVICE_PRINCIPAL_ENTITY_CLASS,
        _type: SERVICE_PRINCIPAL_ENTITY_TYPE,
        userType: 'service',
        category: ['infrastructure'],
        name: data.displayName,
        displayName: data.displayName,
        appDisplayName: data.appDisplayName,
        appId: data.appId,
        servicePrincipalType: data.servicePrincipalType,
        servicePrincipalNames: data.servicePrincipalNames,
      },
    },
  });

  assignTags(entity, data.tags);
  return entity;
}

export function createAccountGroupRelationship(
  account: Entity,
  group: Entity,
): Relationship {
  const parentKey = account._key;
  const childKey = generateEntityKey(group.id);

  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    fromKey: parentKey,
    fromType: ACCOUNT_ENTITY_TYPE,
    toKey: childKey,
    toType: GROUP_ENTITY_TYPE,
    properties: {
      _type: ACCOUNT_GROUP_RELATIONSHIP_TYPE,
    },
  });
}

export function createAccountUserRelationship(
  account: Entity,
  user: Entity,
): Relationship {
  const fromKey = account._key;
  const toKey = generateEntityKey(user.id);

  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    fromType: ACCOUNT_ENTITY_TYPE,
    fromKey,
    toType: USER_ENTITY_TYPE,
    toKey,
  });
}

export function createGroupMemberRelationship(
  group: Entity,
  member: GroupMember,
): Relationship {
  const memberEntityType = getGroupMemberEntityType(member);
  const memberEntityClass = getGroupMemberEntityClass(member);

  const groupKey = generateEntityKey(group.id);
  const memberKey = generateEntityKey(member.id);

  return createMappedRelationship({
    _class: RelationshipClass.HAS,
    _key: generateRelationshipKey(groupKey, memberKey),
    _type: GROUP_MEMBER_RELATIONSHIP_TYPE,
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey: groupKey,
      targetFilterKeys: [['_type', '_key']],
      targetEntity: {
        _type: memberEntityType,
        _class: memberEntityClass,
        _key: memberKey,
        displayName: member.displayName,
        jobTitle: member.jobTitle,
        email: member.mail,
      },
    },
    properties: {
      groupId: group.id as string,
      memberId: member.id,
      memberType: member['@odata.type'],
    },
  });
}

function getGroupMemberEntityType(member: GroupMember): string {
  switch (member['@odata.type']) {
    case MemberType.USER:
      return USER_ENTITY_TYPE;
    case MemberType.GROUP:
      return GROUP_ENTITY_TYPE;
    default:
      return GROUP_MEMBER_ENTITY_TYPE;
  }
}

function getGroupMemberEntityClass(member: GroupMember): string {
  switch (member['@odata.type']) {
    case MemberType.USER:
      return USER_ENTITY_CLASS;
    case MemberType.GROUP:
      return GROUP_ENTITY_CLASS;
    default:
      return GROUP_MEMBER_ENTITY_CLASS;
  }
}
