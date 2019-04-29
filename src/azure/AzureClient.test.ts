import nock from "nock";
import AzureClient from "./AzureClient";

const CLIENT_ID =
  process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_ID || "example_token";
const CLIENT_SECRET =
  process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_SECRET || "example_token";
const DIRRECTORY_ID =
  process.env.AZURE_CLOUD_LOCAL_EXECUTION_DIRRECTORY_ID || "example_token";

describe("AzureClient fetch ok data", () => {
  beforeAll(() => {
    nock.back.fixtures = `${__dirname}/../../test/fixtures/`;
    process.env.CI
      ? nock.back.setMode("lockdown")
      : nock.back.setMode("record");
  });

  async function getAuthenticatedClient() {
    const azure = new AzureClient(CLIENT_ID, CLIENT_SECRET, DIRRECTORY_ID);
    await azure.authenticate();

    return azure;
  }

  test("fetchUsers ok", async () => {
    const { nockDone } = await nock.back("users-ok.json");
    const client = await getAuthenticatedClient();
    const response = await client.fetchUsers();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchGroups ok", async () => {
    const { nockDone } = await nock.back("groups-ok.json");
    const client = await getAuthenticatedClient();
    const response = await client.fetchGroups();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchMembers ok", async () => {
    const { nockDone } = await nock.back("members-ok.json");
    const client = await getAuthenticatedClient();
    const response = await client.fetchMembers(
      "89fac263-2430-48fd-9278-dacfdfc89792",
    );
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  afterAll(() => {
    nock.restore();
  });
});
