import { resourceGroup } from "./utils";

describe("resourceGroup", () => {
  test("undefined", () => {
    expect(resourceGroup(undefined)).toBeUndefined();
  });

  test("not found", () => {
    expect(resourceGroup("not found")).toBeUndefined();
  });

  test("lowercased", () => {
    expect(
      resourceGroup(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Network/networkInterfaces/j1dev",
      ),
    ).toEqual("j1dev");
    expect(
      resourceGroup(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/🤔/providers/Microsoft.Network/networkInterfaces/j1dev",
      ),
    ).toEqual("🤔");
  });
});
