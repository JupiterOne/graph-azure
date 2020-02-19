import { getPortsFromRange } from "./securityGroups";

describe("get port range from string", () => {
  test("range", () => {
    const portRange = "8080-8081";
    expect(getPortsFromRange(portRange)).toEqual({
      fromPort: 8080,
      toPort: 8081,
    });
  });

  test("single port", () => {
    const portRange = "22";
    expect(getPortsFromRange(portRange)).toEqual({
      fromPort: 22,
      toPort: 22,
    });
  });

  test("* => 0-65535", () => {
    const portRange = "*";
    expect(getPortsFromRange(portRange)).toEqual({
      fromPort: 0,
      toPort: 65535,
    });
  });
});
