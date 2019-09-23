import { Polly } from "@pollyjs/core";

import polly from "../../../test/helpers/polly";
import config from "../../../test/integrationInstanceConfig";
import createGraphClient from "./createGraphClient";

let p: Polly;

afterEach(async () => {
  await p.stop();
});

test("createGraphClient accessToken fetched and cached", async () => {
  let requests = 0;

  p = polly(__dirname, "createGraphClient");
  p.server.any().on("request", req => requests++);

  const client = createGraphClient(config);
  await expect(client.api("/").get()).resolves.toMatchObject({
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata",
  });
  expect(requests).toEqual(2);

  await expect(client.api("/").get()).resolves.toMatchObject({
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata",
  });
  expect(requests).toEqual(3);
});
