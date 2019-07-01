import CursoredXwdGrid, {
  STOP,
  NEXT_LINE,
  TOGGLE_DIRECTION
} from "./cursoredXwdGrid";
import { ACROSS, DOWN, LEFT, RIGHT, UP } from "../services/xwdService";

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
  const numbers = [1, 2, 3, "", 4, 5, 6, 7, "", "", "", 8, "", ""];
  const grid = new CursoredXwdGrid(2, 7);
  grid.setNumbers(numbers);
  grid.cursor = [1, 2];
  expect(grid.clueNumber(ACROSS)).toBe(7);
  expect(grid.clueNumber(DOWN)).toBe(3);
});

describe("moveCursor", () => {
  it("simply moves if not at edge", () => {
    const grid = new CursoredXwdGrid(2, 7);
    grid.setCursor(0, 1);
    grid.moveCursor(RIGHT);
    expect(grid.cursor).toEqual([0, 2]);
    grid.moveCursor(DOWN);
    expect(grid.cursor).toEqual([1, 2]);
    grid.moveCursor(LEFT);
    expect(grid.cursor).toEqual([1, 1]);
    grid.moveCursor(UP);
    expect(grid.cursor).toEqual([0, 1]);
  });

  it("wraps around at edge by default", () => {
    const grid = new CursoredXwdGrid(2, 7);
    grid.setCursor(0, 1);
    grid.moveCursor(UP);
    expect(grid.cursor).toEqual([1, 1]);
    grid.setCursor(1, 1);
    grid.moveCursor(DOWN);
    expect(grid.cursor).toEqual([0, 1]);
    grid.setCursor(1, 0);
    grid.moveCursor(LEFT);
    expect(grid.cursor).toEqual([1, 6]);
    grid.setCursor(1, 6);
    grid.moveCursor(RIGHT);
    expect(grid.cursor).toEqual([1, 0]);
  });

  it("stops at edge if you tell it to", () => {
    const grid = new CursoredXwdGrid(2, 7);
    grid.setCursor(0, 1);
    grid.moveCursor(UP, { atLineEnd: STOP });
    expect(grid.cursor).toEqual([0, 1]);
    grid.setCursor(1, 1);
    grid.moveCursor(DOWN, { atLineEnd: STOP });
    expect(grid.cursor).toEqual([1, 1]);
    grid.setCursor(1, 0);
    grid.moveCursor(LEFT, { atLineEnd: STOP });
    expect(grid.cursor).toEqual([1, 0]);
    grid.setCursor(1, 6);
    grid.moveCursor(RIGHT, { atLineEnd: STOP });
    expect(grid.cursor).toEqual([1, 6]);
  });

  it("wraps to next line if you tell it too", () => {
    const grid = new CursoredXwdGrid(2, 7);
    grid.setCursor(0, 1);
    grid.moveCursor(UP, { atLineEnd: NEXT_LINE });
    expect(grid.cursor).toEqual([1, 0]);
    grid.setCursor(1, 1);
    grid.moveCursor(DOWN, { atLineEnd: NEXT_LINE });
    expect(grid.cursor).toEqual([0, 2]);
    grid.setCursor(1, 0);
    grid.moveCursor(LEFT, { atLineEnd: NEXT_LINE });
    expect(grid.cursor).toEqual([0, 6]);
    grid.setCursor(1, 6);
    grid.moveCursor(RIGHT, { atLineEnd: NEXT_LINE });
    expect(grid.cursor).toEqual([0, 0]);
  });

  it("can toggle direction upon puzzle wrap", () => {
    const grid = new CursoredXwdGrid(2, 7);
    grid.setCursor(1, 6);
    grid.moveCursor(RIGHT, {
      atLineEnd: NEXT_LINE,
      atPuzzleEnd: TOGGLE_DIRECTION
    });
    expect(grid.cursor).toEqual([0, 0]);
    expect(grid.direction).toEqual(DOWN);
  });
});

describe("goToNextWord", () => {
  it("advances to next word (same row)", () => {
    const data = { contents: "abc:defghi:jkl".split("") };
    const grid = new CursoredXwdGrid(2, 7, data);
    expect(grid.cell(0, 3).isBlack).toBe(true);
    grid.setCursor(0, 1);
    grid.goToNextWord();
    console.log("uh huh cursor is at", grid.cursor);
    expect(grid.cursor).toEqual([0, 4]);
  });
});
