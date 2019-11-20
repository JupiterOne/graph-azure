import createAzureWebLinker from "./createAzureWebLinker";

const webLinker = createAzureWebLinker("my.onmicrosoft.com");

describe("basic function", () => {
  test("undefined domain", () => {
    const webLinker = createAzureWebLinker(undefined);
    expect(webLinker.portalResourceUrl("/something")).toBeUndefined();
  });

  test("undefined path", () => {
    expect(webLinker.portalResourceUrl(undefined)).toBeUndefined();
  });

  test("domain and path", () => {
    expect(
      webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev",
      ),
    ).toEqual(
      "https://portal.azure.com/#@my.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Network/networkInterfaces/j1dev",
    );
  });
});

describe("storage", () => {
  test("blob", () => {
    expect(
      webLinker.portalResourceUrl(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752",
      ),
    ).toEqual(
      "https://portal.azure.com/#blade/Microsoft_Azure_Storage/ContainerMenuBlade/overview/storageAccountId/%2Fsubscriptions%2Fdccea45f-7035-4a17-8731-1fd46aaa74a0%2FresourceGroups%2Fj1dev%2Fproviders%2FMicrosoft.Storage%2FstorageAccounts%2Fj1dev/path/bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752",
    );
  });
});
