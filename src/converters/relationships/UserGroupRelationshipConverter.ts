import {
  Group,
  GroupMember,
  GroupMembers,
  MemberType,
} from "../../azure/types";

import {
  GROUP_ENTITY_TYPE,
  GroupUserRelationship,
  USER_ENTITY_TYPE,
  USER_GROUP_RELATIONSHIP_CLASS,
  USER_GROUP_RELATIONSHIP_TYPE,
} from "../../jupiterone";

import {
  generateEntityKey,
  generateRelationshipKey,
} from "../../utils/generateKeys";

export function createUserGroupRelationships(
  groupsMembers: GroupMembers[],
): GroupUserRelationship[] {
  return groupsMembers.reduce(
    (relationships, groupMember) => {
      const groupMembers = groupMember.members.reduce(
        (groupMembersRelationships, member) => {
          if (member["@odata.type"] !== MemberType.USER) {
            return groupMembersRelationships;
          }
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
  const childKey = generateEntityKey(USER_ENTITY_TYPE, member.id);
  const parentKey = generateEntityKey(GROUP_ENTITY_TYPE, group.id);
  const key = generateRelationshipKey(
    parentKey,
    childKey,
    USER_GROUP_RELATIONSHIP_CLASS,
  );

  const relationship: GroupUserRelationship = {
    _class: USER_GROUP_RELATIONSHIP_CLASS,
    _fromEntityKey: parentKey,
    _key: key,
    _type: USER_GROUP_RELATIONSHIP_TYPE,
    _toEntityKey: childKey,
  };

  return relationship;
}
