import { Polly } from "@pollyjs/core";

import polly from "../../../test/helpers/polly";
import config from "../../../test/integrationInstanceConfig";
import createGraphClient from "./createGraphClient";
import fetchOrganization from "./fetchOrganization";

let p: Polly;

afterEach(async () => {
  await p.stop();
});

test("fetchOrganization", async () => {
  p = polly(__dirname, "fetchOrganization");

  const client = await createGraphClient(config);
  await expect(fetchOrganization(client)).resolves.toMatchObject({
    verifiedDomains: [
      expect.objectContaining({
        name: expect.any(String),
      }),
    ],
  });
});
