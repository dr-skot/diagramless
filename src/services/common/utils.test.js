import { includesEqual, mod } from "./utils";

describe("includesEqual", () => {
  it("finds an array in a list of arrays", () => {
    expect(includesEqual([[0, 1], [0, 2], [0, 3]], [0, 2])).toBe(true);
  });

  it("doesn't find an array that's not there", () => {
    expect(includesEqual([[0, 1], [0, 3]], [0, 2])).toBe(false);
  });
});

describe("mod", () => {
  it("knows mod(1,6) is 6", () => {
    expect(mod(1, 6)).toBe(1);
  });
  it("knows mod(6,6) is 0", () => {
    expect(mod(6, 6)).toBe(0);
  });
  it("knows mod(7,6) is 1", () => {
    expect(mod(7, 6)).toBe(1);
  });
  it("knows mod(-1,6) is 5", () => {
    expect(mod(-1, 6)).toBe(5);
  });
  it("knows mod(-6,6) is 0", () => {
    expect(mod(-6, 6)).toBe(0);
  });
});
