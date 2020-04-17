import { Vault } from "@azure/arm-keyvault/esm/models";
import { createTestLogger } from "@jupiterone/jupiter-managed-integration-sdk";
import { Polly } from "@pollyjs/core";

import polly from "../../../test/helpers/polly";
import config from "../../../test/integrationInstanceConfig";
import { KeyVaultClient } from "./client";

let p: Polly;

afterEach(async () => {
  await p.stop();
});

describe("iterateKeyVaults", () => {
  test("all", async () => {
    p = polly(__dirname, "iterateKeyVaults");

    const client = new KeyVaultClient(config, createTestLogger(), true);

    const resources: Vault[] = [];
    await client.iterateKeyVaults((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "j1dev",
        tags: expect.objectContaining({
          environment: "j1dev",
        }),
      }),
    ]);
  });
});

describe("iterateKeys", () => {
  test("listing forbidden does not invoke the callback", async () => {
    p = polly(__dirname, "iterateKeysListForbidden", {
      recordFailedRequests: true,
    });

    const vault = {
      properties: {
        vaultUri: "https://j1dev.vault.azure.net/",
      },
    } as Vault;
    const client = new KeyVaultClient(config, createTestLogger(), true);

    const callback = jest.fn();
    await client.iterateKeys(vault, callback);

    expect(callback).not.toHaveBeenCalled();
  });
});
