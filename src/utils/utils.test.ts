import { includesEqual, keysWithTrueValues, getElement, wrapFindIndex, mod } from './utils';
import { vectorAdd, vectorFits, vectorMod } from './vector';

describe('includesEqual', () => {
  it('finds an array in a list of arrays', () => {
    expect(
      includesEqual(
        [
          [0, 1],
          [0, 2],
          [0, 3],
        ],
        [0, 2]
      )
    ).toBe(true);
  });

  it("doesn't find an array that's not there", () => {
    expect(
      includesEqual(
        [
          [0, 1],
          [0, 3],
        ],
        [0, 2]
      )
    ).toBe(false);
  });
});

describe('mod', () => {
  it('knows mod(1,6) is 6', () => {
    expect(mod(1, 6)).toBe(1);
  });
  it('knows mod(6,6) is 0', () => {
    expect(mod(6, 6)).toBe(0);
  });
  it('knows mod(7,6) is 1', () => {
    expect(mod(7, 6)).toBe(1);
  });
  it('knows mod(-1,6) is 5', () => {
    expect(mod(-1, 6)).toBe(5);
  });
  it('knows mod(-6,6) is 0', () => {
    expect(mod(-6, 6)).toBe(0);
  });
});

describe('keysWithTrueValues', () => {
  it('works', () => {
    const obj = { a: true, b: false, c: 'false', d: '' };
    expect(keysWithTrueValues(obj)).toEqual(['a', 'c']);
  });
});

describe('vectorAdd', () => {
  it('adds two vectors', () => {
    expect(vectorAdd([0, 3, -1], [4, 5, 6])).toEqual([4, 8, 5]);
  });
});

describe('vectorMod', () => {
  it('mods two vectors', () => {
    const result = vectorMod([1, 5, -1, -8, 202], [2, 3, 4, 6, 5]);
    expect(result).toEqual([1, 2, 3, 4, 2]);
  });
});

describe('vectorFits', () => {
  it('returns true when vector fits', () => {
    expect(vectorFits([3, 6], [4, 10])).toBe(true);
  });
  it("returns false when vector doesn't fit", () => {
    expect(vectorFits([0, 5], [4, 5])).toBe(false);
    expect(vectorFits([-1, 5], [4, 10])).toBe(false);
  });
});

describe('multiIndex', () => {
  it('indexes a two-d array with a two-d index', () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(getElement(array, [0, 0])).toBe(1);
    expect(getElement(array, [0, 1])).toBe(2);
    expect(getElement(array, [2, 2])).toBe(9);
  });
  it('returns null if any index is out of bounds', () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(getElement(array, [3, 0])).toBeUndefined();
    expect(getElement(array, [1, 3])).toBeUndefined();
    expect(getElement(array, [-1, 2])).toBeUndefined();
    expect(getElement(array, [0, -1])).toBeUndefined();
  });
});

describe('wrapFindIndex', () => {
  it('returns -1 if no matches', () => {
    const result = wrapFindIndex([1, 2, 3, 4, 5], 2, () => false);
    expect(result).toBe(-1);
  });
  it('finds match in back half', () => {
    const result = wrapFindIndex([1, 2, 3, 4, 5], 2, (e) => e === 5);
    expect(result).toBe(4);
  });
  it('finds match in first half', () => {
    const result = wrapFindIndex([1, 2, 3, 4, 5], 2, (e) => e === 2);
    expect(result).toBe(1);
  });
  it('finds match at index', () => {
    const result = wrapFindIndex([1, 2, 3, 4, 5], 2, () => true);
    expect(result).toBe(2);
  });
  it('finds match just before index', () => {
    const result = wrapFindIndex([1, 2, 3, 4, 5], 2, (e) => e === 2);
    expect(result).toBe(1);
  });
});
