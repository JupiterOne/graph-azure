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
  const credentials = await authenticate(config);
  expect(credentials).toBeDefined();
});
