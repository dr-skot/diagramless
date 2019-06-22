import _ from "lodash";

export function getWord(grid, cursor, direction) {
  const [row, col] = cursor;
  const height = grid.length;
  const width = grid[0].length;

  function getCell(row, col) {
    return grid[row][col];
  }

  function off(row, col) {
    return !_.inRange(row, 0, height) || !_.inRange(col, 0, width);
  }

  function black(row, col) {
    return getCell(row, col).isBlack;
  }

  function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
  }

  function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
  }

  // no word if black square
  if (black(row, col)) return null;

  let pos,
    word = [];
  // trace backward from cursor until black or off
  for (
    pos = cursor;
    !off(...pos) && !black(...pos);
    pos = subtract(pos, direction)
  ) {
    word.unshift(pos);
  }

  // trace forward from cursor until black or off
  for (
    pos = add(cursor, direction);
    !off(...pos) && !black(...pos);
    pos = add(pos, direction)
  ) {
    word.push(pos);
  }

  return word;
}
