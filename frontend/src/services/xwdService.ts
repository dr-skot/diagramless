import { range, inRange, repeat, isEqual } from 'lodash';
import { vectorAdd, vectorSubtract, vectorMod, vectorFits } from '../utils/vector';
import { XwdGrid } from '../model/grid';
import { Vector } from '../model/direction';
import { getElement } from '../utils/utils';
// var TextDecoder = TextDecoder || require('text-encoding').TextDecoder;

interface Clue {
  number: string;
  direction: Vector;
  clue: string;
}

let puzzle;

export const LEFT: Vector = [0, -1],
  RIGHT: Vector = [0, 1],
  UP: Vector = [-1, 0],
  DOWN: Vector = [1, 0],
  ACROSS = RIGHT;

export const STOP = 'STOP',
  WRAP_AROUND = 'WRAP_AROUND',
  NEXT_LINE = 'NEXT_LINE';

export function getWord(grid: XwdGrid, cursor: Vector, direction: Vector) {
  const [row, col] = cursor;
  const height = grid.length;
  if (height === 0) return [];
  const width = grid[0].length;

  const off = (row: number, col: number) => !inRange(row, 0, height) || !inRange(col, 0, width);
  const black = (row: number, col: number) => grid[row][col].isBlack;
  const add = (v1: Vector, v2: Vector): Vector => vectorAdd(v1, v2) as Vector;
  const subtract = (v1: Vector, v2: Vector): Vector => vectorSubtract(v1, v2) as Vector;

  // no word if black square
  if (black(row, col)) return null;

  let word = [];
  // trace backward from cursor until black or off
  for (let pos = cursor; !off(...pos) && !black(...pos); pos = subtract(pos, direction)) {
    word.unshift(pos);
  }

  // trace forward from cursor until black or off
  for (
    let pos = add(cursor, direction);
    !off(...pos) && !black(...pos);
    pos = add(pos, direction)
  ) {
    word.push(pos);
  }

  return word;
}

export function puzzleFromFileData(data: ArrayBuffer) {
  if (!data) return;
  // using file descriptions at
  // http://acrossdown.net/specification.htmvar
  // https://code.google.com/archive/p/puz/wikis/FileFormat.wiki
  let decoder = new TextDecoder('ascii'),
    dv = new DataView(data),
    label = decoder.decode(data.slice(2, 13)),
    width = dv.getUint8(0x2c),
    height = dv.getUint8(0x2d),
    size = width * height,
    solution = decoder.decode(data.slice(0x34, 0x34 + size)).split(''),
    guesses = decoder.decode(data.slice(0x34 + size, 0x34 + size * 2)).split(''),
    clueCount = numClues(solution, width),
    info = decoder.decode(data.slice(0x34 + size * 2)).split('\0', clueCount + 4),
    title = info[0],
    author = info[1],
    copyright = info[2],
    numbersAndClues = numberGrid(solution, width, info.slice(3)) as {
      numbers: number[];
      clues: Clue[];
    },
    numbers = numbersAndClues.numbers,
    clues = numbersAndClues.clues,
    note = info[3 + clues.length],
    extras: Record<string, any> = {};

  // process extras as binary data
  let index = 0x34 + size * 2 + (info.join('').length + info.length); // length of strings plus their null terminators
  let code: string, len: number, content;
  while (index < data.byteLength) {
    code = decoder.decode(data.slice(index, index + 4)); // section title
    index += 4;
    len = dv.getInt16(index, true); // length is little-endian Int16 after title
    index += 4; // skip past past 2-byte length & 2-byte checksum
    content = data.slice(index, index + len);
    index += len + 1; // skip null terminator
    extras[code] = content;
  }

  // process rebus
  // The GRBS section is a "board" of one byte per square
  // Each byte indicates whether or not the square contains a rebus. Possible values are:
  //    0: no rebus
  //    1+n: a rebus, the solution for which is given by the entry with key n in the RTBL section
  // The RTBL section  is a string containing the solutions for any rebus squares.
  // These solutions are given as an ascii string. For each rebus there is a number, a colon, a string and a semicolon.
  // The number (an ascii string) is always two characters long - if it is only one digit, the first character is a space.
  // It is key that the GRBS section uses to refer to this entry (it is one less than the number that appears in the GRBS).
  // The string is the rebus solution.
  // For example, in a puzzle which had four rebus squares "HEART", "DIAMOND", "CLUB", and "SPADE", the string might be:
  //    " 0:HEART; 1:DIAMOND;17:CLUB;23:SPADE;"
  if (extras.GRBS) extras.GRBS = new Uint8Array(extras.GRBS);
  if (extras.GRBS && extras.RTBL) {
    let table: string[] = [];
    decoder
      .decode(extras.RTBL)
      .trim()
      .replace(/;$/, '')
      .split(/; */)
      .forEach(function (item) {
        const kv = item.split(':');
        table[parseInt(kv[0])] = kv[1];
      });
    extras.RTBL = table;
    for (let k = 0; k < size; k++) {
      if (extras.GRBS[k]) {
        solution[k] = table[extras.GRBS[k] - 1];
      }
    }
  }

  // The GEXT section is a "board" of one byte per square.
  // Each byte is a bitmask indicating that some style attributes are set.
  // The meanings of four bits are known:
  //    0x10 means that the square was previously marked incorrect
  //    0x20 means that the square is currently marked incorrect
  //    0x40 means that the contents were given
  //    0x80 means that the square is circled.
  // None, some, or all of these bits may be set for each square. It is possible that they have reserved other values.
  if (extras.GEXT) extras.GEXT = new Uint8Array(extras.GEXT);

  // TODO support LTIM
  // The LTIM section stores two pieces of information: time elapsed and whether the timer is running.
  // An ascii string, two integers separated by a comma
  // <seconds elapsed>,<timer running ? 1 : 0>
  // "42,1" means 42 seconds have elapsed, and timer is running

  puzzle = {
    label,
    width,
    height,
    solution,
    guesses,
    clues,
    numbers,
    author,
    title,
    copyright,
    note,
    extras,
    // TODO can we get the date?
    date: '',
  };

  // TODO: do this right. It's just to remove : from guesses in diagramless
  // The situation seems to be: in solution, ':' means a black square, and puzzle is meant to be diagramless
  // in guesses, ':' means user has not filled this square, but square is black in solution
  // '.' I guess would mean user has marked the square black
  puzzle.guesses = repeat('-', puzzle.guesses.length).split('');
  console.log(puzzle);
  return puzzle;
}

function numberGrid(grid: string[], width: number, clueList: string[]) {
  let number = 1;
  let numbers: number[] = [];
  let clues: Clue[] | null = clueList ? [] : null;

  range(0, grid.length).forEach((k) => {
    [ACROSS, DOWN].forEach((dir) => {
      if (isStartCell(grid, width, k, dir)) {
        if (clues)
          clues.push({
            number: number + '',
            direction: dir,
            clue: clueList[clues.length],
          });
        numbers[k] = number;
      }
    });
    if (numbers[k]) number++;
  });
  return clues ? { numbers: numbers, clues: clues } : numbers;
}

function numClues(grid: string[], width: number) {
  let count = 0;
  range(0, grid.length).forEach((k) => {
    [ACROSS, DOWN].forEach((dir) => {
      if (isStartCell(grid, width, k, dir)) count++;
    });
  });
  return count;
}

function isStartCell(grid: string[], width: number, k: number, direction: Vector) {
  const one = direction === ACROSS ? 1 : width,
    place = direction === ACROSS ? k % width : Math.floor(k / width),
    startsLine = place === 0,
    endsLine = direction === ACROSS ? place === width - 1 : k + width >= grid.length;
  return (
    !isBlack(grid, k) &&
    (startsLine || isBlack(grid, k - one)) &&
    !(endsLine || isBlack(grid, k + one))
  );
}

function isBlack(grid: string[], k: number) {
  return grid[k] === ':' || grid[k] === '.';
}

// returns new cursor position after moving one cell in direction
// on a grid of a certain size
//    start: starting position, [row, col]
//    direction: LEFT | RIGHT | UP | DOWN
//    dimensions: grid size, [height, width];
//    options:
//       atLineEnd: STOP | WRAP_AROUND | NEXT_LINE (default WRAP_AROUND)
//       onPuzzleWrap: a callback triggered when wrapping past the end of the puzzle
export interface MoveOnGridOptions {
  atLineEnd: 'STOP' | 'WRAP_AROUND' | 'NEXT_LINE';
  onPuzzleWrap: () => void;
  until: (pos: Vector) => boolean;
}

export function moveOnGrid(
  start: Vector,
  direction: Vector,
  gridSize: Vector,
  options: Partial<MoveOnGridOptions> = {}
): Vector {
  const { atLineEnd, onPuzzleWrap, until } = options;

  if (until) {
    return moveOnGridUntil(until, start, direction, gridSize, {
      atLineEnd,
      onPuzzleWrap,
    });
  }

  const vector = direction; // TODO make direction a string & look up vector
  const onGrid = (position: Vector) => vectorFits(position, gridSize);
  const wrap = (position: Vector) => vectorMod(position, gridSize);

  const unwrapped = vectorAdd(start, vector) as Vector;
  if (onGrid(unwrapped)) return unwrapped;
  if (atLineEnd === STOP) return start;

  const wrapped = wrap(unwrapped) as Vector;
  if (atLineEnd !== NEXT_LINE) return wrapped;

  const crossVector = vector.slice().reverse();
  const lineAdvanced = vectorAdd(wrapped, crossVector) as Vector;
  if (onGrid(lineAdvanced)) return lineAdvanced;

  const puzzleWrapped = wrap(lineAdvanced);
  if (onPuzzleWrap) onPuzzleWrap();
  return puzzleWrapped as Vector;
}

export function moveOnGridUntil(
  found: (pos: Vector) => boolean,
  start: Vector,
  direction: Vector,
  gridSize: Vector,
  options: Partial<MoveOnGridOptions> = {}
) {
  let position = start,
    lastPosition;
  do {
    lastPosition = position;
    position = moveOnGrid(position, direction, gridSize, options);
  } while (
    !found(position) && // haven't fulfilled condition
    !isEqual(position, lastPosition) && // still moving
    !isEqual(position, start) // not back where we started
  );
  return position;
}

function isWhiteCell(grid: XwdGrid, pos: Vector) {
  const cell = getElement(grid, pos);
  return cell && !cell.isBlack;
}

// returns true if cell at cursor starts a word in direction
//    grid: a two d array of cells, where black cells have a true property isBlack
export function isWordStart(cursor: Vector, direction: Vector, grid: XwdGrid) {
  const vector = direction; // TODO make direction a string & look up vector
  const oneBack = vectorSubtract(cursor, vector) as Vector,
    oneForward = vectorAdd(cursor, vector) as Vector,
    white = (pos: Vector) => isWhiteCell(grid, pos);
  return white(cursor) && !white(oneBack) && white(oneForward);
}

export function parseRelatedClues(clue: string) {
  const regex = /(\d+-(,|,? and|,? or) )*\d+-(Across|Down)/gi;
  const matches = clue.match(regex) || [];
  return matches
    .map((match) => {
      const numbers = match.match(/\d+/g);
      const direction = match.match(/across/i) ? ACROSS : DOWN;
      return numbers!.map((number) => {
        return { number, direction };
      });
    })
    .flat();
}
