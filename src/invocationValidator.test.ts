import invocationValidator from "./invocationValidator";

test("should do nothing in example", async () => {
  await invocationValidator({} as any);
});
