import { createAccountGroupRelationships } from "./AccountGroupRelationshipConverter";

test("convert account -> group relationships", async () => {
  const groups = [
    {
      id: "89fac263-2430-48fd-9278-dacfdfc89792",
      deletedDateTime: undefined,
      classification: undefined,
      createdDateTime: "2019-04-23T18:06:05Z",
      creationOptions: [],
      description: "descr",
      displayName: "test group",
      groupTypes: [],
      mail: undefined,
      mailEnabled: false,
      mailNickname: "8bb2d1c34",
      onPremisesLastSyncDateTime: undefined,
      onPremisesSecurityIdentifier: undefined,
      onPremisesSyncEnabled: undefined,
      preferredDataLocation: undefined,
      proxyAddresses: [],
      renewedDateTime: "2019-04-23T18:06:05Z",
      resourceBehaviorOptions: [],
      resourceProvisioningOptions: [],
      securityEnabled: true,
      visibility: undefined,
      onPremisesProvisioningErrors: [],
    },
  ];

  const account = {
    _class: "Account",
    _key: "azure_account_id",
    _type: "azure_account",
    cluster: "example.com",
    displayName: "name",
  };
  const relationships = createAccountGroupRelationships(groups, account);

  expect(relationships).toEqual([
    {
      _class: "HAS",
      _fromEntityKey: "azure_account_id",
      _key:
        "azure_account_id_has_azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792",
      _toEntityKey: "azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792",
      _type: "azure_account_has_group",
    },
  ]);
});
