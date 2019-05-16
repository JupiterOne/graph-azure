import {
  IntegrationActionName,
  IntegrationExecutionContext,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureClient } from "./azure";
import executionHandler from "./executionHandler";
import initializeContext from "./initializeContext";

jest.mock("./azure");

const clients = {
  graph: {
    findEntitiesByType: jest.fn().mockResolvedValue([]),
    findRelationshipsByType: jest.fn().mockResolvedValue([]),
  },
  persister: {
    processEntities: jest.fn().mockReturnValue([]),
    processRelationships: jest.fn().mockReturnValue([]),
    publishEntityOperations: jest.fn().mockResolvedValue({}),
    publishRelationshipOperations: jest.fn().mockResolvedValue({}),
    publishPersisterOperations: jest.fn().mockResolvedValue({}),
  } as PersisterClient,
};

let azureClient: AzureClient;
let executionContext: IntegrationExecutionContext;

jest.mock("./initializeContext");

beforeEach(() => {
  azureClient = ({
    authenticate: jest.fn().mockReturnValue([]),
    fetchGroups: jest.fn().mockReturnValue([
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
    ]),
    fetchUsers: jest.fn().mockReturnValue([
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
    ]),
    fetchMembers: jest.fn().mockReturnValue([
      {
        "@odata.type": "#microsoft.graph.user",
        id: "324e8daa-9c29-42a4-a74b-b9893e6d9750",
        businessPhones: [],
        displayName: "Second Test User",
        givenName: "Second",
        jobTitle: "Developer",
        mail: null,
        mobilePhone: null,
        officeLocation: null,
        preferredLanguage: null,
        surname: "Test",
        userPrincipalName: "second@admintestdualboot.onmicrosoft.com",
      },
      {
        "@odata.type": "#microsoft.graph.group",
        id: "89fac263-2430-48fd-9278-dacfdfc89792",
        deletedDateTime: null,
        classification: null,
        createdDateTime: "2019-04-23T18:06:05Z",
        creationOptions: [],
        description: null,
        displayName: "test group",
        groupTypes: [],
        mail: null,
        mailEnabled: false,
        mailNickname: "8bb2d1c34",
        onPremisesLastSyncDateTime: null,
        onPremisesSecurityIdentifier: null,
        onPremisesSyncEnabled: null,
        preferredDataLocation: null,
        proxyAddresses: [],
        renewedDateTime: "2019-04-23T18:06:05Z",
        resourceBehaviorOptions: [],
        resourceProvisioningOptions: [],
        securityEnabled: true,
        visibility: null,
        onPremisesProvisioningErrors: [],
      },
    ]),
  } as unknown) as AzureClient;

  executionContext = ({
    event: {
      action: {
        name: IntegrationActionName.INGEST,
      },
    },
    ...clients,
    azure: azureClient,
    instance: {
      config: {},
    },
  } as unknown) as IntegrationExecutionContext;

  (initializeContext as jest.Mock).mockReturnValue(executionContext);
});

describe("INGEST", () => {
  test("all azure data", async () => {
    await executionHandler(executionContext);

    expect(azureClient.fetchGroups).toHaveBeenCalledTimes(1);
    expect(azureClient.fetchUsers).toHaveBeenCalledTimes(1);
    expect(azureClient.fetchMembers).toHaveBeenCalledTimes(1);
    expect(clients.persister.processEntities).toHaveBeenCalledTimes(3);
    expect(clients.persister.processRelationships).toHaveBeenCalledTimes(5);
  });

  test("do not change graph when API response invalid", async () => {
    azureClient = ({
      authenticate: jest.fn().mockReturnValue(undefined),
      fetchGroups: jest.fn().mockReturnValue(undefined),

      fetchUsers: jest.fn().mockReturnValue(undefined),
      fetchMembers: jest.fn().mockReturnValue(undefined),
    } as unknown) as AzureClient;

    executionContext = ({
      event: {
        action: {
          name: IntegrationActionName.INGEST,
        },
      },
      ...clients,
      azure: azureClient,
      instance: {
        config: {},
      },
    } as unknown) as IntegrationExecutionContext;

    (initializeContext as jest.Mock).mockReturnValue(executionContext);

    await executionHandler(executionContext);

    expect(clients.persister.processEntities).toHaveBeenCalledTimes(1);
    expect(clients.persister.processRelationships).toHaveBeenCalledTimes(0);
  });
});

describe("INVALID EVENT", () => {
  test("all azure data", async () => {
    executionContext = ({
      event: {
        action: {
          name: "RANDOM",
        },
      },
      ...clients,
      azure: azureClient,
      instance: {
        config: {},
      },
    } as unknown) as IntegrationExecutionContext;

    await executionHandler(executionContext);

    expect(azureClient.fetchGroups).toHaveBeenCalledTimes(0);
    expect(azureClient.fetchUsers).toHaveBeenCalledTimes(0);
    expect(azureClient.fetchMembers).toHaveBeenCalledTimes(0);
  });
});
