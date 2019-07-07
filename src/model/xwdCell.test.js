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

describe("isCorrect", () => {
  it("detects correct blackness", () => {
    const cell = new XwdCell();
    cell.isBlack = true;
    cell.solution = { isBlack: true };
    expect(cell.isCorrect()).toBe(true);
  });
  it("detects incorrect blackness", () => {
    const cell = new XwdCell();
    cell.isBlack = true;
    cell.solution = { isBlack: false };
    expect(cell.isCorrect()).toBe(false);
  });
  it("ignores content for black cells", () => {
    const cell = new XwdCell();
    Object.assign(cell, { isBlack = true, content: "A" });
    cell.solution = { isBlack: true, content: "B" };
    expect(cell.isCorrect()).toBe(true);
  });
  it("rejects mismatched content for non-black cells", () => {
    const cell = new XwdCell();
    Object.assign(cell, { isBlack = false, content: "A" });
    cell.solution = { isBlack: false, content: "B" };
    expect(cell.isCorrect()).toBe(false);
  });
  it("likes matching content in non-black cells", () => {
    const cell = new XwdCell();
    Object.assign(cell, { isBlack = false, content: "B" });
    cell.solution = { isBlack: false, content: "B" };
    expect(cell.isCorrect()).toBe(true);
  });
});
