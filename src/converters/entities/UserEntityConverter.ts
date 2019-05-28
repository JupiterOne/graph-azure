import { User, UserManager } from "../../azure/types";
import {
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  UserEntity,
} from "../../jupiterone";

import { generateEntityKey } from "../../utils/generateKeys";

export function createUserEntities(
  data: User[],
  userManagers: UserManager[],
): UserEntity[] {
  return data.map(u => {
    let user: UserEntity = {
      _class: USER_ENTITY_CLASS,
      _key: generateEntityKey(USER_ENTITY_TYPE, u.id),
      _type: USER_ENTITY_TYPE,
      displayName: u.displayName,
      firstName: u.givenName,
      lastName: u.surname,
      givenName: u.givenName,
      jobTitle: u.jobTitle,
      mail: u.mail,
      mobilePhone: u.mobilePhone,
      officeLocation: u.officeLocation,
      preferredLanguage: u.preferredLanguage,
      surname: u.surname,
      userPrincipalName: u.userPrincipalName,
      id: u.id,
      email: u.userPrincipalName,
      title: u.jobTitle,
      name: u.displayName,
      username: u.mailNickname,
      employeeType: u.userType,
      employeeNumber: u.employeeId,
    };

    user = assignManager(user, userManagers);

    return user;
  });
}

function assignManager(
  user: UserEntity,
  userManagers: UserManager[],
): UserEntity {
  const userManager = userManagers.find(um => um.user.id === user.id);

  if (userManager && userManager.manager) {
    user.manager = userManager.manager.displayName;
    user.managerId = userManager.manager.mailNickname;
    user.managerEmail = userManager.manager.mail;
  }

  return user;
}
