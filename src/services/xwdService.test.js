import { getWord } from "./xwdService";

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
