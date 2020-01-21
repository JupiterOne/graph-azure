import { BlobContainer, StorageAccount } from "@azure/arm-storage/esm/models";

import { createAzureWebLinker } from "../../azure";
import {
  createStorageServiceEntity,
  createStorageContainerEntity,
} from "./storage";

const webLinker = createAzureWebLinker("something.onmicrosoft.com");

const storageAccount: StorageAccount = {
  sku: {
    name: "Standard_LRS",
    tier: "Standard",
  },
  kind: "Storage",
  id:
    "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev",
  name: "j1dev",
  type: "Microsoft.Storage/storageAccounts",
  location: "eastus",
  tags: {
    environment: "j1dev",
  },
  privateEndpointConnections: [],
  isHnsEnabled: false,
  encryption: {
    services: {
      file: {
        enabled: true,
        lastEnabledTime: ("2019-10-09T18:53:02.2416314Z" as unknown) as Date,
      },
      blob: {
        enabled: true,
        lastEnabledTime: ("2019-10-09T18:53:02.2416314Z" as unknown) as Date,
      },
    },
    keySource: "Microsoft.Storage",
  },
  provisioningState: "Succeeded",
  creationTime: ("2019-10-09T18:53:02.1947326Z" as unknown) as Date,
  primaryEndpoints: {
    blob: "https://j1dev.blob.core.windows.net/",
    queue: "https://j1dev.queue.core.windows.net/",
    table: "https://j1dev.table.core.windows.net/",
    file: "https://j1dev.file.core.windows.net/",
  },
  primaryLocation: "eastus",
  statusOfPrimary: "available",
};

describe("createStorageAccountEntity", () => {
  const data = storageAccount;

  test("properties transferred blob", () => {
    const entity = {
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev#blob",
      _type: "azure_storage_blob_service",
      _class: ["Service"],
      _rawData: [{ name: "default", rawData: data }],
      name: "j1dev",
      displayName: "j1dev (blob)",
      region: "eastus",
      environment: "j1dev",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/containersList",
      ),
      sku: "Standard_LRS",
      resourceGroup: "j1dev",
      category: ["infrastructure"],
      endpoints: ["https://j1dev.blob.core.windows.net/"],
      "tag.environment": "j1dev",
    };

    expect(createStorageServiceEntity(webLinker, data, "blob")).toEqual(entity);
  });

  test("properties transferred file", () => {
    const entity = {
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev#file",
      _type: "azure_storage_file_service",
      _class: ["Service"],
      _rawData: [{ name: "default", rawData: data }],
      name: "j1dev",
      displayName: "j1dev (file)",
      region: "eastus",
      environment: "j1dev",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/fileList",
      ),
      sku: "Standard_LRS",
      resourceGroup: "j1dev",
      category: ["infrastructure"],
      endpoints: ["https://j1dev.file.core.windows.net/"],
      "tag.environment": "j1dev",
    };

    expect(createStorageServiceEntity(webLinker, data, "file")).toEqual(entity);
  });

  test("properties transferred queue", () => {
    const entity = {
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev#queue",
      _type: "azure_storage_queue_service",
      _class: ["Service"],
      _rawData: [{ name: "default", rawData: data }],
      name: "j1dev",
      displayName: "j1dev (queue)",
      region: "eastus",
      environment: "j1dev",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/queueList",
      ),
      sku: "Standard_LRS",
      resourceGroup: "j1dev",
      category: ["infrastructure"],
      endpoints: ["https://j1dev.queue.core.windows.net/"],
      "tag.environment": "j1dev",
    };

    expect(createStorageServiceEntity(webLinker, data, "queue")).toEqual(
      entity,
    );
  });

  test("properties transferred table", () => {
    const entity = {
      _key:
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev#table",
      _type: "azure_storage_table_service",
      _class: ["Service"],
      _rawData: [{ name: "default", rawData: data }],
      name: "j1dev",
      displayName: "j1dev (table)",
      region: "eastus",
      environment: "j1dev",
      webLink: webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/tableList",
      ),
      sku: "Standard_LRS",
      resourceGroup: "j1dev",
      category: ["infrastructure"],
      endpoints: ["https://j1dev.table.core.windows.net/"],
      "tag.environment": "j1dev",
    };

    expect(createStorageServiceEntity(webLinker, data, "table")).toEqual(
      entity,
    );
  });
});

describe("createStorageBlobContainerEntity", () => {
  const data: BlobContainer = {
    id:
      "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752",
    name: "bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752",
    type: "Microsoft.Storage/storageAccounts/blobServices/containers",
    etag: '"0x8D76DE4341D7231"',
    publicAccess: "None",
    leaseStatus: "Unlocked",
    leaseState: "Available",
    lastModifiedTime: ("2019-11-20T18:05:19.0000000Z" as unknown) as Date,
    hasImmutabilityPolicy: false,
    hasLegalHold: false,
  };

  const entity = {
    _key:
      "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752",
    _type: "azure_storage_container",
    _class: ["DataStore"],
    _rawData: [{ name: "default", rawData: data }],
    name: "bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752",
    displayName: "bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752",
    webLink: webLinker.portalResourceUrl(
      "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752",
    ),
    resourceGroup: "j1dev",
    public: false,
    publicAccess: "None",
    classification: null,
    encrypted: true,
  };

  test("properties transferred", () => {
    expect(
      createStorageContainerEntity(webLinker, storageAccount, data),
    ).toEqual(entity);
  });

  test("public container", () => {
    expect(
      createStorageContainerEntity(webLinker, storageAccount, {
        ...data,
        publicAccess: "Container",
      }),
    ).toEqual({
      ...entity,
      _rawData: [
        { name: "default", rawData: { ...data, publicAccess: "Container" } },
      ],
      public: true,
      publicAccess: "Container",
    });
  });

  test("public blob", () => {
    expect(
      createStorageContainerEntity(webLinker, storageAccount, {
        ...data,
        publicAccess: "Blob",
      }),
    ).toEqual({
      ...entity,
      _rawData: [
        { name: "default", rawData: { ...data, publicAccess: "Blob" } },
      ],
      public: true,
      publicAccess: "Blob",
    });
  });

  test("blob encryption not enabled", () => {
    expect(
      createStorageContainerEntity(
        webLinker,
        {
          ...storageAccount,
          encryption: {
            keySource: "Microsoft.Storage",
            services: { blob: { enabled: false } },
          },
        },
        data,
      ),
    ).toEqual({
      ...entity,
      encrypted: false,
    });
  });

  test("blob encryption service not provided", () => {
    expect(
      createStorageContainerEntity(
        webLinker,
        {
          ...storageAccount,
          encryption: {
            keySource: "Microsoft.Storage",
            services: {},
          },
        },
        data,
      ),
    ).toEqual({
      ...entity,
      encrypted: false,
    });
  });
});
