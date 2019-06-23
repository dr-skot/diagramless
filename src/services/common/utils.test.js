import { includesEqual } from "./utils";

it("finds an array in a list of arrays", () => {
  expect(includesEqual([[0, 1], [0, 2], [0, 3]], [0, 2])).toBe(true);
});
