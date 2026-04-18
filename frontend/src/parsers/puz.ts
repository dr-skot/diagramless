import { range, repeat } from 'lodash';
import { ACROSS, DOWN, Vector } from '../model/navigation';

interface Clue {
  number: string;
  direction: Vector;
  clue: string;
}

export function puzzleFromFileData(data: ArrayBuffer) {
  if (!data || data.byteLength < 0x35) return;
  // using file descriptions at
  // http://acrossdown.net/specification.htmvar
  // https://code.google.com/archive/p/puz/wikis/FileFormat.wiki
  let decoder = new TextDecoder('ascii'),
    dv = new DataView(data),
    label = decoder.decode(data.slice(2, 13));
  if (label !== 'ACROSS&DOWN') return;
  let
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

  let puzzle = {
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
