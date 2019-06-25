import XwdGrid from "./xwdGrid";

it("creates a grid of the right size", () => {
  const xwd = new XwdGrid(5, 10);
  expect(xwd.height).toBe(5);
  expect(xwd.width).toBe(10);
});

it("doesn't choke on zero", () => {
  const xwd = new XwdGrid(0, 0);
  expect(xwd.height).toBe(0);
  expect(xwd.width).toBe(0);
});

it("is made of XwdCells", () => {
  const xwd = new XwdGrid(5, 5);
  expect(xwd.cell(2, 3).constructor.name).toBe("XwdCell");
});

it("can read puzzle contents", () => {
  const data = "abc:defghi:jkl".split("");
  const xwd = new XwdGrid(2, 7);
  xwd.setContents(data);
  expect(xwd.cell(0, 0).content).toBe("a");
  expect(xwd.cell(0, 3).isBlack).toBe(true);
});
