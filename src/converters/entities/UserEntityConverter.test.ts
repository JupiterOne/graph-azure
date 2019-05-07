import { createUserEntities } from "./UserEntityConverter";

test("convert users", async () => {
  const users = [
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
    {
      businessPhones: [],
      displayName: undefined,
      givenName: undefined,
      jobTitle: undefined,
      mail: undefined,
      mobilePhone: undefined,
      officeLocation: undefined,
      preferredLanguage: undefined,
      surname: undefined,
      userPrincipalName: undefined,
      id: "19f7fe21-48c7-4cdb-ab87-99670e9f3af0",
    },
  ];

  const entities = createUserEntities(users);

  expect(entities).toEqual([
    {
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
    },
    {
      _class: "User",
      _key: "azure_user_324e8daa-9c29-42a4-a74b-b9893e6d9750",
      _type: "azure_user",
      displayName: "Second Test User",
      givenName: "Second",
      id: "324e8daa-9c29-42a4-a74b-b9893e6d9750",
      jobTitle: "Developer",
      mail: undefined,
      mobilePhone: undefined,
      officeLocation: undefined,
      preferredLanguage: undefined,
      surname: "Test",
      userPrincipalName: "second@admintestdualboot.onmicrosoft.com",
    },
    {
      _class: "User",
      _key: "azure_user_19f7fe21-48c7-4cdb-ab87-99670e9f3af0",
      _type: "azure_user",
      displayName: undefined,
      givenName: undefined,
      id: "19f7fe21-48c7-4cdb-ab87-99670e9f3af0",
      jobTitle: undefined,
      mail: undefined,
      mobilePhone: undefined,
      officeLocation: undefined,
      preferredLanguage: undefined,
      surname: undefined,
      userPrincipalName: undefined,
    },
  ]);
});
