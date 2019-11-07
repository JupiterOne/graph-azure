import { resourceGroupName } from "./utils";

describe("resourceGroupName", () => {
  test("undefined", () => {
    expect(resourceGroupName(undefined)).toBeUndefined();
  });

  test("not found", () => {
    expect(resourceGroupName("not found")).toBeUndefined();
  });

  test("lowercased", () => {
    expect(
      resourceGroupName(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/J1DEV/providers/Microsoft.Network/networkInterfaces/j1dev",
      ),
    ).toEqual("j1dev");
    expect(
      resourceGroupName(
        "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/🤔/providers/Microsoft.Network/networkInterfaces/j1dev",
      ),
    ).toEqual("🤔");
  });

  test("throws error when required, id undefined", () => {
    expect(() => resourceGroupName(undefined, true)).toThrowError(/not found/i);
  });

  test("throws error when required, not found", () => {
    expect(() => resourceGroupName("something strange", true)).toThrowError(
      /not found/i,
    );
  });
});
