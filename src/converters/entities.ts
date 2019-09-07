import { IntegrationInstance } from "@jupiterone/jupiter-managed-integration-sdk";

import { Group, User } from "../azure";
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  AccountEntity,
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GroupEntity,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  UserEntity,
} from "../jupiterone";
import { generateEntityKey } from "../utils/generateKeys";
import getTime from "../utils/getTime";

export function createAccountEntity(
  instance: IntegrationInstance,
): AccountEntity {
  return {
    _class: ACCOUNT_ENTITY_CLASS,
    _key: generateEntityKey(ACCOUNT_ENTITY_TYPE, instance.id),
    _type: ACCOUNT_ENTITY_TYPE,
    displayName: instance.name,
  };
}

export function createGroupEntity(d: Group): GroupEntity {
  return {
    _class: GROUP_ENTITY_CLASS,
    _key: generateEntityKey(GROUP_ENTITY_TYPE, d.id),
    _type: GROUP_ENTITY_TYPE,
    displayName: d.displayName,
    id: d.id,
    deletedDateTime: getTime(d.deletedDateTime),
    classification: d.classification,
    createdDateTime: getTime(d.createdDateTime),
    description: d.description,
    mail: d.mail,
    mailEnabled: d.mailEnabled,
    mailNickname: d.mailNickname,
    renewedDateTime: getTime(d.renewedDateTime),
    securityEnabled: d.securityEnabled,
  };
}

export function createUserEntity(data: User): UserEntity {
  return {
    _class: USER_ENTITY_CLASS,
    _key: generateEntityKey(USER_ENTITY_TYPE, data.id),
    _type: USER_ENTITY_TYPE,
    displayName: data.displayName,
    givenName: data.givenName,
    jobTitle: data.jobTitle,
    mail: data.mail,
    mobilePhone: data.mobilePhone,
    officeLocation: data.officeLocation,
    preferredLanguage: data.preferredLanguage,
    surname: data.surname,
    userPrincipalName: data.userPrincipalName,
    id: data.id,
  };
}
