import { User } from "../../azure/types";
import {
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  UserEntity,
} from "../../jupiterone";

import { generateEntityKey } from "../../utils/generateKeys";

export function createUserEntities(data: User[]): UserEntity[] {
  return data.map(u => {
    const user: UserEntity = {
      _class: USER_ENTITY_CLASS,
      _key: generateEntityKey(USER_ENTITY_TYPE, u.id),
      _type: USER_ENTITY_TYPE,
      displayName: u.displayName || "",
      givenName: u.givenName || "",
      jobTitle: u.jobTitle,
      mail: u.mail,
      mobilePhone: u.mobilePhone,
      officeLocation: u.officeLocation,
      preferredLanguage: u.preferredLanguage,
      surname: u.surname,
      userPrincipalName: u.userPrincipalName || "",
      id: u.id,
    };

    return user;
  });
}
