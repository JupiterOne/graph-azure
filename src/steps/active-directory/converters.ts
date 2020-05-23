import {
  createIntegrationRelationship,
  Entity,
  Relationship,
  RelationshipDirection,
  IntegrationInstance,
  createIntegrationEntity,
  getTime,
} from "@jupiterone/integration-sdk";

import { GroupMember, MemberType } from "./client";
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GROUP_MEMBER_ENTITY_CLASS,
  GROUP_MEMBER_ENTITY_TYPE,
  GROUP_MEMBER_RELATIONSHIP_TYPE,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  ACCOUNT_ENTITY_CLASS,
} from "../../jupiterone";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../../utils/generateKeys";

import map from "lodash.map";

import { Group, Organization, User } from "@microsoft/microsoft-graph-types";

export function createAccountEntity(instance: IntegrationInstance): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _class: ACCOUNT_ENTITY_CLASS,
        _key: generateEntityKey(ACCOUNT_ENTITY_TYPE, instance.id),
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
): Entity {
  let defaultDomain: string | undefined;
  const verifiedDomains = map(organization.verifiedDomains, (e) => {
    if (e.isDefault) {
      defaultDomain = e.name;
    }
    return e.name as string;
  });

  return createIntegrationEntity({
    entityData: {
      source: organization,
      assign: {
        _class: ACCOUNT_ENTITY_CLASS,
        _key: generateEntityKey(ACCOUNT_ENTITY_TYPE, instance.id),
        _type: ACCOUNT_ENTITY_TYPE,
        name: organization.displayName,
        displayName: instance.name,
        organizationName: organization.displayName,
        defaultDomain,
        verifiedDomains,
      },
    },
  });
}

export function createGroupEntity(d: Group): Entity {
  return {
    _class: GROUP_ENTITY_CLASS,
    _key: generateEntityKey(GROUP_ENTITY_TYPE, d.id),
    _type: GROUP_ENTITY_TYPE,
    displayName: d.displayName,
    id: d.id,
    deletedOn: getTime(d.deletedDateTime),
    classification: d.classification,
    createdOn: getTime(d.createdDateTime),
    description: d.description,
    email: d.mail,
    mail: d.mail,
    mailEnabled: d.mailEnabled,
    mailNickname: d.mailNickname,
    renewedOn: getTime(d.renewedDateTime),
    securityEnabled: d.securityEnabled,
  };
}

export function createUserEntity(data: User): Entity {
  return {
    _class: USER_ENTITY_CLASS,
    _key: generateEntityKey(USER_ENTITY_TYPE, data.id),
    _type: USER_ENTITY_TYPE,
    displayName: data.displayName,
    givenName: data.givenName,
    firstName: data.givenName,
    jobTitle: data.jobTitle,
    email: data.mail,
    mail: data.mail,
    mobilePhone: data.mobilePhone,
    officeLocation: data.officeLocation,
    preferredLanguage: data.preferredLanguage,
    surname: data.surname,
    lastName: data.surname,
    userPrincipalName: data.userPrincipalName,
    id: data.id,
  };
}

export function createAccountGroupRelationship(
  account: Entity,
  group: Entity,
): Relationship {
  const parentKey = account._key;
  const childKey = generateEntityKey(GROUP_ENTITY_TYPE, group.id);

  return createIntegrationRelationship({
    _class: "HAS",
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
  const toKey = generateEntityKey(USER_ENTITY_TYPE, user.id);

  return createIntegrationRelationship({
    _class: "HAS",
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

  const groupKey = generateEntityKey(GROUP_ENTITY_TYPE, group.id);
  const memberKey = generateEntityKey(memberEntityType, member.id);

  // TODO Check with Phil about how moving an integration to the new SDK will
  // handle the mapped relationships.
  return createIntegrationRelationship({
    _class: "HAS",
    _key: memberKey,
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey: groupKey,
      targetFilterKeys: [["_type", "_key"]],
      targetEntity: {
        _type: memberEntityType,
        _class: memberEntityClass,
        displayName: member.displayName,
        jobTitle: member.jobTitle,
        email: member.mail,
      },
    },
    properties: {
      _key: generateRelationshipKey(groupKey, memberKey),
      _type: GROUP_MEMBER_RELATIONSHIP_TYPE,
      groupId: group.id,
      memberId: member.id,
      memberType: member["@odata.type"],
    },
  });
}

function getGroupMemberEntityType(member: GroupMember): string {
  switch (member["@odata.type"]) {
    case MemberType.USER:
      return USER_ENTITY_TYPE;
    case MemberType.GROUP:
      return GROUP_ENTITY_TYPE;
    default:
      return GROUP_MEMBER_ENTITY_TYPE;
  }
}

function getGroupMemberEntityClass(member: GroupMember): string {
  switch (member["@odata.type"]) {
    case MemberType.USER:
      return USER_ENTITY_CLASS;
    case MemberType.GROUP:
      return GROUP_ENTITY_CLASS;
    default:
      return GROUP_MEMBER_ENTITY_CLASS;
  }
}
