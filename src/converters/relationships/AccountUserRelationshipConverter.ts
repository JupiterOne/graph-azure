import { User } from "../../azure/types";

import {
  ACCOUNT_USER_RELATIONSHIP_CLASS,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  AccountEntity,
  AccountUserRelationship,
  USER_ENTITY_TYPE,
} from "../../jupiterone";

import {
  generateEntityKey,
  generateRelationshipKey,
} from "../../utils/generateKeys";

export function createAccountUserRelationships(
  users: User[],
  account: AccountEntity,
): AccountUserRelationship[] {
  const defaultValue: AccountUserRelationship[] = [];

  return users.reduce((acc, user) => {
    const parentKey = account._key;
    const childKey = generateEntityKey(USER_ENTITY_TYPE, user.id);
    const key = generateRelationshipKey(
      parentKey,
      childKey,
      ACCOUNT_USER_RELATIONSHIP_CLASS,
    );

    const relationship: AccountUserRelationship = {
      _class: ACCOUNT_USER_RELATIONSHIP_CLASS,
      _fromEntityKey: parentKey,
      _key: key,
      _type: ACCOUNT_USER_RELATIONSHIP_TYPE,
      _toEntityKey: childKey,
    };

    return [...acc, relationship];
  }, defaultValue);
}
