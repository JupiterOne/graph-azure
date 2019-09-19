import { Polly } from "@pollyjs/core";

import polly from "../../../test/helpers/polly";
import config from "../../../test/integrationInstanceConfig";
import authenticate from "./authenticate";

let p: Polly;

afterEach(async () => {
  await p.stop();
});

test("authenticate with subscription matching", async () => {
  p = polly(__dirname, "authenticate");
  const credentials = await authenticate(config);
  expect(credentials).toBeDefined();
});

test("authenticate with subscription not matching", async () => {
  p = polly(__dirname, "authenticate bad subscription");
  await expect(
    authenticate({ ...config, subscriptionId: "junk" }),
  ).rejects.toThrow(/not found in tenant/);
});

test("authenticate with no subscription", async () => {
  p = polly(__dirname, "authenticate no subscription");
  await expect(
    authenticate({
      ...config,
      subscriptionId: undefined,
    }),
  ).rejects.toThrow(/without/);
});
