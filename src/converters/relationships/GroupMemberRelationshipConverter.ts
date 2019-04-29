import {
  Group,
  GroupMember,
  GroupMembers,
  MemberType,
} from "../../azure/types";

import {
  GROUP_ENTITY_TYPE,
  GROUP_GROUP_RELATIONSHIP_CLASS,
  GROUP_GROUP_RELATIONSHIP_TYPE,
  GROUP_USER_RELATIONSHIP_CLASS,
  GROUP_USER_RELATIONSHIP_TYPE,
  GroupUserRelationship,
  USER_ENTITY_TYPE,
} from "../../jupiterone";

import {
  generateEntityKey,
  generateRelationshipKey,
} from "../../utils/generateKeys";

export function createGroupMemberRelationships(
  groupsMembers: GroupMembers[],
): GroupUserRelationship[] {
  return groupsMembers.reduce(
    (relationships, groupMember) => {
      const groupMembers = groupMember.members.reduce(
        (groupMembersRelationships, member) => {
          const relationship = createRelationship(groupMember.group, member);

          return [...groupMembersRelationships, relationship];
        },
        [] as GroupUserRelationship[],
      );

      return [...relationships, ...groupMembers];
    },
    [] as GroupUserRelationship[],
  );
}

function createRelationship(group: Group, member: GroupMember) {
  const childKey = getMemberKey(member);
  const parentKey = generateEntityKey(GROUP_ENTITY_TYPE, group.id);

  const relationshipType =
    member["@odata.type"] === MemberType.USER
      ? GROUP_USER_RELATIONSHIP_TYPE
      : GROUP_GROUP_RELATIONSHIP_TYPE;

  const relationshipClass =
    member["@odata.type"] === MemberType.USER
      ? GROUP_USER_RELATIONSHIP_CLASS
      : GROUP_GROUP_RELATIONSHIP_CLASS;

  const key = generateRelationshipKey(parentKey, childKey, relationshipClass);

  const relationship: GroupUserRelationship = {
    _class: relationshipClass,
    _fromEntityKey: parentKey,
    _key: key,
    _type: relationshipType,
    _toEntityKey: childKey,
  };

  return relationship;
}

function getMemberKey(member: GroupMember) {
  const type =
    member["@odata.type"] === MemberType.USER
      ? USER_ENTITY_TYPE
      : GROUP_ENTITY_TYPE;
  return generateEntityKey(type, member.id);
}
