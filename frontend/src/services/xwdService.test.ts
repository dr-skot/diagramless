import {
  getWord,
  isWordStart,
  parseRelatedClues,
  parseTitle,
} from './xwdService';
import { UP, DOWN, LEFT, RIGHT, ACROSS } from './xwdService';
import { XwdGrid } from '../model/grid';
import { Vector } from '../model/navigation';

describe('getWord', () => {
  it('finds whole row if no blacks', () => {
    const grid = [
      [{}, {}, {}],
      [{}, {}, {}],
      [{}, {}, {}],
    ] as XwdGrid;
    const cursor: Vector = [1, 1];
    const direction: Vector = [0, 1];
    expect(getWord(grid, cursor, direction)).toEqual([
      [1, 0],
      [1, 1],
      [1, 2],
    ]);
  });

  it('finds whole col if no blacks', () => {
    const grid = [
      [{}, {}, {}],
      [{}, {}, {}],
      [{}, {}, {}],
    ] as XwdGrid;
    const cursor: Vector = [1, 1];
    const direction: Vector = [1, 0];
    expect(getWord(grid, cursor, direction)).toEqual([
      [0, 1],
      [1, 1],
      [2, 1],
    ]);
  });

  it('finds word from black to end', () => {
    const grid = [
      [{}, {}, {}],
      [{}, { isBlack: true }, {}],
      [{}, {}, {}],
      [{}, {}, {}],
    ] as XwdGrid;
    const cursor = [2, 1] as Vector;
    const direction = [1, 0] as Vector;
    expect(getWord(grid, cursor, direction)).toEqual([
      [2, 1],
      [3, 1],
    ]);
  });

  it('finds word from end to black', () => {
    const grid = [
      [{}, {}, {}, {}],
      [{}, {}, { isBlack: true }, {}],
      [{}, {}, {}, {}],
    ];
    const cursor = [1, 1];
    const direction = [0, 1];
    // @ts-ignore
    expect(getWord(grid, cursor, direction)).toEqual([
      [1, 0],
      [1, 1],
    ]);
  });

  it('finds word from black to black', () => {
    const grid = [[{}, { isBlack: true }, {}, {}, {}, { isBlack: true }]];
    const cursor = [0, 3];
    const direction = [0, 1];
    // @ts-ignore
    expect(getWord(grid, cursor, direction)).toEqual([
      [0, 2],
      [0, 3],
      [0, 4],
    ]);
  });

  it("doesn't break on empty grid", () => {
    expect(getWord([], [1, 1], [0, 1])).toEqual([]);
  });
});

describe('isWordStart', () => {
  it('is true at puzzle edge', () => {
    const grid = [
      [{}, {}, {}],
      [{}, {}, {}],
      [{}, {}, {}],
    ] as XwdGrid;
    expect(isWordStart([0, 1], DOWN, grid)).toBe(true);
    expect(isWordStart([1, 0], ACROSS, grid)).toBe(true);
  });

  it('is false in midword', () => {
    const grid = [
      [{ isBlack: true }, {}, {}],
      [{}, {}, {}],
      [{}, {}, {}],
    ] as XwdGrid;
    expect(isWordStart([0, 2], ACROSS, grid)).toBe(false);
    expect(isWordStart([2, 0], DOWN, grid)).toBe(false);
  });

  it('is true after black square', () => {
    const grid = [
      [{ isBlack: true }, {}, {}],
      [{}, {}, {}],
      [{}, {}, {}],
    ] as XwdGrid;
    expect(isWordStart([0, 1], ACROSS, grid)).toBe(true);
    expect(isWordStart([1, 0], DOWN, grid)).toBe(true);
  });
});

describe('parseRelatedClues', () => {
  it('finds simple cases', () => {
    expect(parseRelatedClues('blah blah 18-Down blah 25-Across blarf')).toEqual([
      { direction: DOWN, number: '18' },
      { direction: ACROSS, number: '25' },
    ]);
  });
  it('finds complicated cases', () => {
    expect(parseRelatedClues('blah blah 18-, 20-, and 25-Across blarf')).toEqual([
      { direction: ACROSS, number: '18' },
      { direction: ACROSS, number: '20' },
      { direction: ACROSS, number: '25' },
    ]);
  });
  it("doesn't choke on nothing", () => {
    expect(parseRelatedClues('blah blah blah')).toEqual([]);
  });
  it('corectly parses a clue with a slash', () => {
    const clue =
      "Slogan that celebrates a young woman's confidence and independence ... or a hint to 17-, 24-, 40-/41- and 49-Across";
    expect(parseRelatedClues(clue)).toEqual([
      { direction: ACROSS, number: '17' },
      { direction: ACROSS, number: '24' },
      { direction: ACROSS, number: '40' },
      { direction: ACROSS, number: '41' },
      { direction: ACROSS, number: '49' },
    ]);
  });
});

describe('parseTitle', () => {
  it('handles simple cases', () => {
    expect(parseTitle('New York Times, Tuesday, April 26, 2022')).toEqual({
      title: 'The Daily Crossword',
      date: new Date('4/26/2022'),
      dayOfWeek: 'Tuesday',
      monthDayYear: 'April 26, 2022',
    });
  });
})
