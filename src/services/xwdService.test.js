import {
  getWord,
  moveOnGrid,
  moveOnGridUntil,
  isWordStart
} from "./xwdService";
import { UP, DOWN, LEFT, RIGHT, ACROSS } from "./xwdService";
import { STOP, NEXT_LINE } from "./xwdService";

describe("getWord", () => {
  it("finds whole row if no blacks", () => {
    const grid = [[{}, {}, {}], [{}, {}, {}], [{}, {}, {}]];
    const cursor = [1, 1];
    const direction = [0, 1];
    expect(getWord(grid, cursor, direction)).toEqual([[1, 0], [1, 1], [1, 2]]);
  });

  it("finds whole col if no blacks", () => {
    const grid = [[{}, {}, {}], [{}, {}, {}], [{}, {}, {}]];
    const cursor = [1, 1];
    const direction = [1, 0];
    expect(getWord(grid, cursor, direction)).toEqual([[0, 1], [1, 1], [2, 1]]);
  });

  it("finds word from black to end", () => {
    const grid = [
      [{}, {}, {}],
      [{}, { isBlack: true }, {}],
      [{}, {}, {}],
      [{}, {}, {}]
    ];
    const cursor = [2, 1];
    const direction = [1, 0];
    expect(getWord(grid, cursor, direction)).toEqual([[2, 1], [3, 1]]);
  });

  it("finds word from end to black", () => {
    const grid = [
      [{}, {}, {}, {}],
      [{}, {}, { isBlack: true }, {}],
      [{}, {}, {}, {}]
    ];
    const cursor = [1, 1];
    const direction = [0, 1];
    expect(getWord(grid, cursor, direction)).toEqual([[1, 0], [1, 1]]);
  });

  it("finds word from black to black", () => {
    const grid = [[{}, { isBlack: true }, {}, {}, {}, { isBlack: true }]];
    const cursor = [0, 3];
    const direction = [0, 1];
    expect(getWord(grid, cursor, direction)).toEqual([[0, 2], [0, 3], [0, 4]]);
  });

  it("doesn't break on empty grid", () => {
    expect(getWord([], [1, 1], [0, 1])).toEqual([]);
  });
});

describe("moveCursor", () => {
  it("simply moves if not at edge", () => {
    expect(moveOnGrid([0, 1], RIGHT, [2, 7])).toEqual([0, 2]);
    expect(moveOnGrid([0, 2], DOWN, [2, 7])).toEqual([1, 2]);
    expect(moveOnGrid([1, 2], LEFT, [2, 7])).toEqual([1, 1]);
    expect(moveOnGrid([1, 1], UP, [2, 7])).toEqual([0, 1]);
  });

  it("wraps around at edge by default", () => {
    expect(moveOnGrid([0, 1], UP, [2, 7])).toEqual([1, 1]);
    expect(moveOnGrid([1, 1], DOWN, [2, 7])).toEqual([0, 1]);
    expect(moveOnGrid([1, 0], LEFT, [2, 7])).toEqual([1, 6]);
    expect(moveOnGrid([1, 6], RIGHT, [2, 7])).toEqual([1, 0]);
  });

  it("stops at edge if you tell it to", () => {
    const dim = [2, 7],
      opts = { atLineEnd: STOP };
    expect(moveOnGrid([0, 1], UP, dim, opts)).toEqual([0, 1]);
    expect(moveOnGrid([1, 1], DOWN, dim, opts)).toEqual([1, 1]);
    expect(moveOnGrid([1, 0], LEFT, dim, opts)).toEqual([1, 0]);
    expect(moveOnGrid([1, 6], RIGHT, dim, opts)).toEqual([1, 6]);
  });

  it("doesn't mutate the direction when next-line wrapping", () => {
    const dim = [2, 7],
      opts = { atLineEnd: NEXT_LINE };
    moveOnGrid([0, 1], UP, dim, opts);
    expect(UP).toEqual([-1, 0]);
  });

  it("wraps to next line if you tell it to", () => {
    const dim = [2, 7],
      opts = { atLineEnd: NEXT_LINE };
    expect(moveOnGrid([0, 1], UP, dim, opts)).toEqual([1, 0]);
    expect(moveOnGrid([1, 1], DOWN, dim, opts)).toEqual([0, 2]);
    expect(moveOnGrid([1, 0], LEFT, dim, opts)).toEqual([0, 6]);
    expect(moveOnGrid([1, 6], RIGHT, dim, opts)).toEqual([0, 0]);
  });

  it("triggers callback upon puzzle wrap", () => {
    let triggered = false;
    const dim = [2, 7],
      opts = {
        atLineEnd: NEXT_LINE,
        onPuzzleWrap: () => {
          triggered = true;
        }
      };

    moveOnGrid([1, 6], RIGHT, dim, opts);
    expect(triggered).toBe(true);

    triggered = false;
    moveOnGrid([0, 0], UP, dim, opts);
    expect(triggered).toBe(true);
  });
});

describe("isWordStart", () => {
  it("is true at puzzle edge", () => {
    const grid = [[{}, {}, {}], [{}, {}, {}], [{}, {}, {}]];
    expect(isWordStart([0, 1], DOWN, grid)).toBe(true);
    expect(isWordStart([1, 0], ACROSS, grid)).toBe(true);
  });

  it("is false in midword", () => {
    const grid = [[{ isBlack: true }, {}, {}], [{}, {}, {}], [{}, {}, {}]];
    expect(isWordStart([0, 2], ACROSS, grid)).toBe(false);
    expect(isWordStart([2, 0], DOWN, grid)).toBe(false);
  });

  it("is true after black square", () => {
    const grid = [[{ isBlack: true }, {}, {}], [{}, {}, {}], [{}, {}, {}]];
    expect(isWordStart([0, 1], ACROSS, grid)).toBe(true);
    expect(isWordStart([1, 0], DOWN, grid)).toBe(true);
  });
});

describe("moveOnGridUntil", () => {
  it("stops when it gets back to original cursor position", () => {
    const never = () => false;
    expect(moveOnGridUntil(never, [1, 1], RIGHT, [4, 4])).toEqual([1, 1]);
  });
  it("stops if it gets stuck", () => {
    const never = () => false;
    expect(
      moveOnGridUntil(never, [1, 1], RIGHT, [3, 3], { atLineEnd: STOP })
    ).toEqual([1, 2]);
  });
  it("stops when the condition is met", () => {
    const condition = position => position[1] === 2;
    expect(moveOnGridUntil(condition, [1, 1], RIGHT, [4, 4])).toEqual([1, 2]);
  });
  it("can be invoked as an option using moveOnGrid", () => {
    const options = { until: position => position[1] === 2 };
    expect(moveOnGrid([1, 1], RIGHT, [4, 4], options)).toEqual([1, 2]);
  });
});
