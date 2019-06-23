import XwdCell from "./xwdCell";

it("doesn't start black", () => {
  expect(new XwdCell().isBlack).toBe(false);
});

it("can be made black", () => {
  const cell = new XwdCell();
  cell.isBlack = true;
  expect(cell.isBlack).toBe(true);
});

it("can be made unblack again", () => {
  const cell = new XwdCell();
  cell.isBlack = true;
  cell.isBlack = false;
  expect(cell.isBlack).toBe(false);
});

it("can be toggled black/not black", () => {
  const cell = new XwdCell();
  cell.toggleBlack();
  expect(cell.isBlack).toBe(true);
  cell.toggleBlack();
  expect(cell.isBlack).toBe(false);
});
