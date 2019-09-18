import { IntegrationError } from "@jupiterone/jupiter-managed-integration-sdk";
import { Polly } from "@pollyjs/core";

import polly from "../../../test/helpers/polly";
import config from "../../../test/integrationInstanceConfig";
import authenticate from "./authenticate";

let p: Polly;

afterEach(async () => {
  await p.stop();
});

test("authenticate", async () => {
  p = polly(__dirname, "authenticate");
  const token = await authenticate(config);
  expect(token).toBeDefined();
});

test("authenticate invalid credentials", async () => {
  p = polly(__dirname, "authenticate invalid", { recordFailedRequests: true });
  await expect(
    authenticate({ ...config, clientSecret: "somejunkfortest" }),
  ).rejects.toThrow(IntegrationError);
});
