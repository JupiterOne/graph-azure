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
      if (!groupMember.members) {
        return relationships;
      }

      const groupMembers = groupMember.members.reduce(
        (groupMembersRelationships, member) => {
          const relationship = createRelationship(groupMember.group, member);
          if (relationship) {
            return [...groupMembersRelationships, relationship];
          }

          return groupMembersRelationships;
        },
        [] as GroupUserRelationship[],
      );

      return [...relationships, ...groupMembers];
    },
    [] as GroupUserRelationship[],
  );
}

function createRelationship(group: Group, member: GroupMember) {
  const memberType = getMemberType(member);
  const relationshipType = getRelationshipType(member);
  const relationshipClass = getRelationshipClass(member);

  if (!(memberType && relationshipType && relationshipClass)) {
    return null;
  }

  const childKey = generateEntityKey(memberType, member.id);
  const parentKey = generateEntityKey(GROUP_ENTITY_TYPE, group.id);

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

function getMemberType(member: GroupMember) {
  switch (member["@odata.type"]) {
    case MemberType.USER:
      return USER_ENTITY_TYPE;
    case MemberType.GROUP:
      return GROUP_ENTITY_TYPE;
  }
}

function getRelationshipType(member: GroupMember) {
  switch (member["@odata.type"]) {
    case MemberType.USER:
      return GROUP_USER_RELATIONSHIP_TYPE;
    case MemberType.GROUP:
      return GROUP_GROUP_RELATIONSHIP_TYPE;
  }
}

function getRelationshipClass(member: GroupMember) {
  switch (member["@odata.type"]) {
    case MemberType.USER:
      return GROUP_USER_RELATIONSHIP_CLASS;
    case MemberType.GROUP:
      return GROUP_GROUP_RELATIONSHIP_CLASS;
  }
}
