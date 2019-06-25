import CursoredXwdGrid from "./cursoredXwdGrid";
import { ACROSS, DOWN } from "../services/xwdService";

it("starts at 0, 0 pointing across", () => {
  const grid = new CursoredXwdGrid(5, 5);
  expect(grid.cursor).toEqual([0, 0]);
  expect(grid.direction).toEqual([0, 1]);
});

it("finds the current word", () => {
  const grid = new CursoredXwdGrid(5, 5);
  grid.cell(0, 1).isBlack = true;
  grid.cursor = [0, 4];
  expect(grid.word).toEqual([[0, 2], [0, 3], [0, 4]]);
});

it("finds the crossing word", () => {
  const grid = new CursoredXwdGrid(5, 5);
  grid.cell(0, 1).isBlack = true;
  grid.cell(4, 1).isBlack = true;
  grid.cursor = [3, 1];
  expect(grid.crossingWord).toEqual([[1, 1], [2, 1], [3, 1]]);
});

it("can find clue numbers", () => {
  const data = "abc:defghi:jkl".split("");
  const numbers = [1, 2, 3, "", 4, 5, 6, 7, "", "", "", 8, "", ""];
  const grid = new CursoredXwdGrid(2, 7);
  grid.setNumbers(numbers);
  grid.cursor = [1, 2];
  expect(grid.clueNumber(ACROSS)).toBe(7);
  expect(grid.clueNumber(DOWN)).toBe(3);
});
