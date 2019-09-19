import { IntegrationInstance } from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAccountEntity,
  createGroupEntity,
  createUserEntity,
} from "./entities";

describe("createAccountEntity", () => {
  test("properties transferred", () => {
    const instance = {
      id: "id",
      name: "name",
      config: {},
    } as IntegrationInstance;

    const accountEntity = createAccountEntity(instance);

    expect(accountEntity).toEqual({
      _class: "Account",
      _key: "azure_account_id",
      _type: "azure_account",
      displayName: "name",
    });
  });
});

describe("createGroupEntity", () => {
  test("properties transferred", () => {
    expect(
      createGroupEntity({
        id: "89fac263-2430-48fd-9278-dacfdfc89792",
        deletedDateTime: undefined,
        classification: undefined,
        createdDateTime: "2019-04-23T18:06:05Z",
        description: "descr",
        displayName: "test group",
        groupTypes: [],
        mail: undefined,
        mailEnabled: false,
        mailNickname: "8bb2d1c34",
        onPremisesLastSyncDateTime: undefined,
        onPremisesSecurityIdentifier: undefined,
        onPremisesSyncEnabled: undefined,
        proxyAddresses: [],
        renewedDateTime: "2019-04-23T18:06:05Z",
        securityEnabled: true,
        visibility: undefined,
        onPremisesProvisioningErrors: [],
      }),
    ).toEqual({
      _class: "UserGroup",
      _key: "azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792",
      _type: "azure_user_group",
      classification: undefined,
      createdDateTime: 1556042765000,
      deletedDateTime: undefined,
      description: "descr",
      displayName: "test group",
      id: "89fac263-2430-48fd-9278-dacfdfc89792",
      mail: undefined,
      mailEnabled: false,
      mailNickname: "8bb2d1c34",
      renewedDateTime: 1556042765000,
      securityEnabled: true,
    });
  });
});

describe("createUserEntity", () => {
  test("properties transferred", () => {
    expect(
      createUserEntity({
        businessPhones: ["+1 2223334444"],
        displayName: "Andrew Kulakov",
        givenName: "Andrew",
        jobTitle: "test title",
        mail: undefined,
        mobilePhone: "+1 2223334444",
        officeLocation: "DBP",
        preferredLanguage: undefined,
        surname: "Kulakov",
        userPrincipalName:
          "admin_test.dualboot.com#EXT#@admintestdualboot.onmicrosoft.com",
        id: "abf00eda-02d6-4053-a077-eef036e1a4c8",
      }),
    ).toEqual({
      _class: "User",
      _key: "azure_user_abf00eda-02d6-4053-a077-eef036e1a4c8",
      _type: "azure_user",
      displayName: "Andrew Kulakov",
      givenName: "Andrew",
      id: "abf00eda-02d6-4053-a077-eef036e1a4c8",
      jobTitle: "test title",
      mail: undefined,
      mobilePhone: "+1 2223334444",
      officeLocation: "DBP",
      preferredLanguage: undefined,
      surname: "Kulakov",
      userPrincipalName:
        "admin_test.dualboot.com#EXT#@admintestdualboot.onmicrosoft.com",
    });
  });
});
