import { createAzureWebLinker } from "../../../azure";
import { createKeyVaultEntity } from "./converters";
import { Vault } from "@azure/arm-keyvault/esm/models";

const webLinker = createAzureWebLinker("something.onmicrosoft.com");

describe("createKeyVaultEntity", () => {
  const data: Vault = {
    id:
      "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev",
    name: "j1dev",
    type: "Microsoft.KeyVault/vaults",
    location: "eastus",
    tags: {
      environment: "j1dev",
      classification: "production",
    },
    properties: {
      sku: {
        // family: "A",
        name: "standard",
      },
      tenantId: "a76fc728-0cba-45f0-a9eb-d45207e14513",
      networkAcls: {
        bypass: "AzureServices",
        defaultAction: "Deny",
        ipRules: [],
        virtualNetworkRules: [],
      },
      accessPolicies: [
        {
          tenantId: "a76fc728-0cba-45f0-a9eb-d45207e14513",
          objectId: "f3978934-b53d-4d34-bc11-afc1bb409cd8",
          permissions: {
            keys: ["get"],
            secrets: ["get"],
            certificates: [],
            storage: [],
          },
        },
      ],
      enabledForDeployment: false,
      enabledForDiskEncryption: true,
      enabledForTemplateDeployment: false,
      vaultUri: "https://j1dev.vault.azure.net/",
      // provisioningState: "Succeeded",
    },
  };

  test("properties", () => {
    expect(createKeyVaultEntity(webLinker, data)).toEqual({
      _class: ["Service"],
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev",
      _rawData: [
        {
          name: "default",
          rawData: data,
        },
      ],
      _type: "azure_keyvault_service",
      id:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev",
      createdOn: undefined,
      displayName: "j1dev",
      name: "j1dev",
      region: "eastus",
      resourceGroup: "j1dev",
      "tag.environment": "j1dev",
      "tag.classification": "production",
      environment: "j1dev",
      classification: "production",
      webLink:
        "https://portal.azure.com/#@something.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/j1dev",
      category: ["infrastructure"],
      endpoints: ["https://j1dev.vault.azure.net/"],
    });
  });
});
