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
