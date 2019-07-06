import XwdGrid from "./xwdGrid";
import { ACROSS, DOWN } from "../services/xwdService";

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

it("s cells are plain objects", () => {
  const xwd = new XwdGrid(5, 5);
  expect(xwd.cell(2, 3).constructor.name).toBe("Object");
});

it("can read puzzle contents", () => {
  const data = "abc:defghi:jkl".split("");
  const xwd = new XwdGrid(2, 7);
  xwd.setContents(data);
  expect(xwd.cell(0, 0).content).toBe("a");
  expect(xwd.cell(0, 3).isBlack).toBe(true);
});

it("reads puzzle contents in the constructor", () => {
  const xwd = new XwdGrid(2, 7, { contents: "abc:defghi:jkl" });
  expect(xwd.cell(0, 0).content).toBe("a");
  expect(xwd.cell(0, 3).isBlack).toBe(true);
});

it("can step through all cells", () => {
  const xwd = new XwdGrid(2, 7);
  xwd.forEachCell((cell, { pos }) => {
    cell.pos = pos;
  });
  expect(xwd.cell(1, 0).pos).toBe(7);
});

it("knows when it's filled", () => {
  const data = "abc:defghi:jkl".split("");
  const xwd = new XwdGrid(2, 7);
  xwd.setContents(data);
  expect(xwd.isFilled).toBe(true);
});

it("knows when it's not filled", () => {
  const data = "abc:defghi: kl".split("");
  const xwd = new XwdGrid(2, 7);
  xwd.setContents(data);
  expect(xwd.isFilled).toBe(false);
});

describe("word", () => {
  it("can find the across word", () => {
    const grid = new XwdGrid(5, 5);
    grid.cell(0, 1).isBlack = true;
    expect(grid.word(0, 4, ACROSS)).toEqual([[0, 2], [0, 3], [0, 4]]);
  });

  it("can find the down word", () => {
    const grid = new XwdGrid(5, 5);
    grid.cell(0, 1).isBlack = true;
    grid.cell(4, 1).isBlack = true;
    expect(grid.word(3, 1, DOWN)).toEqual([[1, 1], [2, 1], [3, 1]]);
  });

  it("returns falsy for black squares", () => {
    const grid = new XwdGrid(5, 5);
    grid.cell(0, 1).isBlack = true;
    expect(grid.word(0, 1, ACROSS)).toBeFalsy();
  });
});

it("can find clue numbers", () => {
  const numbers = [1, 2, 3, "", 4, 5, 6, 7, "", "", "", 8, "", ""];
  const grid = new XwdGrid(2, 7);
  grid.setNumbers(numbers);
  expect(grid.clueNumber(1, 2, ACROSS)).toBe(7);
  expect(grid.clueNumber(1, 2, DOWN)).toBe(3);
});
