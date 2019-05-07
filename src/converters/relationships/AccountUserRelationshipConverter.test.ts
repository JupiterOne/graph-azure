import { createAccountUserRelationships } from "./AccountUserRelationshipConverter";

test("convert account -> group relationships", async () => {
  const groups = [
    {
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
    },
    {
      businessPhones: [],
      displayName: "Second Test User",
      givenName: "Second",
      jobTitle: "Developer",
      mail: undefined,
      mobilePhone: undefined,
      officeLocation: undefined,
      preferredLanguage: undefined,
      surname: "Test",
      userPrincipalName: "second@admintestdualboot.onmicrosoft.com",
      id: "324e8daa-9c29-42a4-a74b-b9893e6d9750",
    },
  ];

  const account = {
    _class: "Account",
    _key: "azure_account_id",
    _type: "azure_account",
    cluster: "example.com",
    displayName: "name",
  };
  const relationships = createAccountUserRelationships(groups, account);

  expect(relationships).toEqual([
    {
      _class: "HAS",
      _fromEntityKey: "azure_account_id",
      _key:
        "azure_account_id_has_azure_user_abf00eda-02d6-4053-a077-eef036e1a4c8",
      _toEntityKey: "azure_user_abf00eda-02d6-4053-a077-eef036e1a4c8",
      _type: "azure_account_has_user",
    },
    {
      _class: "HAS",
      _fromEntityKey: "azure_account_id",
      _key:
        "azure_account_id_has_azure_user_324e8daa-9c29-42a4-a74b-b9893e6d9750",
      _toEntityKey: "azure_user_324e8daa-9c29-42a4-a74b-b9893e6d9750",
      _type: "azure_account_has_user",
    },
  ]);
});
