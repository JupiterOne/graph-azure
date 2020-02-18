import map from "lodash.map";

import {
  createIntegrationEntity,
  EntityFromIntegration,
  IntegrationInstance,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { Organization } from "@microsoft/microsoft-graph-types";

import { Group, User } from "../azure";
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
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
): EntityFromIntegration {
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
): EntityFromIntegration {
  let defaultDomain: string | undefined;
  const verifiedDomains = map(organization.verifiedDomains, e => {
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

export function createGroupEntity(d: Group): GroupEntity {
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

export function createUserEntity(data: User): UserEntity {
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
