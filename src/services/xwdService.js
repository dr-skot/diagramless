import _ from "lodash";
import {
  vectorAdd,
  vectorSubtract,
  vectorMod,
  vectorFits,
  getElement
} from "./common/utils";

var puzzle;

export const LEFT = [0, -1],
  RIGHT = [0, 1],
  UP = [-1, 0],
  DOWN = [1, 0],
  ACROSS = RIGHT;

export const STOP = "STOP",
  WRAP_AROUND = "WRAP_AROUND",
  NEXT_LINE = "NEXT_LINE";

export function getWord(grid, cursor, direction) {
  const [row, col] = cursor;
  const height = grid.length;
  if (height === 0) return [];
  const width = grid[0].length;

  function off(row, col) {
    return !_.inRange(row, 0, height) || !_.inRange(col, 0, width);
  }

  function black(row, col) {
    return grid[row][col].isBlack;
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

export function puzzleFromFileData(data) {
  if (!data) return;
  // using file descriptions at
  // http://acrossdown.net/specification.htmvar puzzle = {}
  // https://code.google.com/archive/p/puz/wikis/FileFormat.wiki
  var decoder = new TextDecoder("ascii"),
    dv = new DataView(data),
    label = decoder.decode(data.slice(2, 13)),
    width = dv.getUint8(0x2c),
    height = dv.getUint8(0x2d),
    size = width * height,
    solution = decoder.decode(data.slice(0x34, 0x34 + size)).split(""),
    guesses = decoder
      .decode(data.slice(0x34 + size, 0x34 + size * 2))
      .split(""),
    clueCount = numClues(solution, width),
    info = decoder
      .decode(data.slice(0x34 + size * 2))
      .split("\0", clueCount + 4),
    title = info[0],
    author = info[1],
    copyright = info[2],
    numbersAndClues = numberGrid(solution, width, info.slice(3)),
    numbers = numbersAndClues.numbers,
    clues = numbersAndClues.clues,
    note = info[3 + clues.length],
    extras = {};

  // process extras as binary data
  var index = 0x34 + size * 2 + (info.join("").length + info.length); // length of strings plus their null terminators
  var code, len, content;
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
  if (extras.GRBS) extras.GRBS = new Uint8Array(extras.GEXT);
  if (extras.GRBS && extras.RTBL) {
    var table = [];
    decoder
      .decode(extras.RTBL)
      .trim()
      .replace(/;$/, "")
      .split(/; */)
      .forEach(function(item) {
        var kv = item.split(":");
        table[parseInt(kv[0])] = kv[1];
      });
    extras.RTBL = table;
    for (var k = 0; k < size; k++) {
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
    extras
  };

  // TODO: do this right. It's just to remove : from guesses in diagramless
  // The situation seems to be: in solution, ':' means a black square, and puzzle is meant to be diagramless
  // in guesses, ':' means user has not filled this square, but square is black in solution
  // '.' I guess would mean user has marked the square black
  puzzle.guesses = _.repeat("-", puzzle.guesses.length).split("");
  return puzzle;
}

function numberGrid(grid, width, clueList) {
  var number = 1;
  var numbers = [];
  var clues = clueList ? [] : null;

  _.range(0, grid.length).forEach(k => {
    [ACROSS, DOWN].forEach(dir => {
      if (isStartCell(grid, width, k, dir)) {
        if (clues)
          clues.push({
            number: number,
            direction: dir,
            clue: clueList[clues.length]
          });
        numbers[k] = number;
      }
    });
    if (numbers[k]) number++;
  });
  return clues ? { numbers: numbers, clues: clues } : numbers;
}

function numClues(grid, width) {
  var count = 0;
  _.range(0, grid.length).forEach(k => {
    [ACROSS, DOWN].forEach(function(dir) {
      if (isStartCell(grid, width, k, dir)) count++;
    });
  });
  return count;
}

function isStartCell(grid, width, k, direction) {
  var one = direction === ACROSS ? 1 : width,
    place = direction === ACROSS ? k % width : Math.floor(k / width),
    startsLine = place === 0,
    endsLine =
      direction === ACROSS ? place === width - 1 : k + width >= grid.length;
  return (
    !isBlack(grid, k) &&
    (startsLine || isBlack(grid, k - one)) &&
    !(endsLine || isBlack(grid, k + one))
  );
}

function isBlack(grid, k) {
  return grid[k] === ":" || grid[k] === ".";
}

// returns new cursor position after moving one cell in direction
// on a grid of a certain size
//    start: starting position, [row, col]
//    direction: LEFT | RIGHT | UP | DOWN
//    dimensions: grid size, [height, width];
//    options:
//       atLineEnd: STOP | WRAP_AROUND | NEXT_LINE (default WRAP_AROUND)
//       onPuzzleWrap: a callback triggered when wrapping past the end of the puzzle
export function moveOnGrid(start, direction, gridSize, options) {
  const { atLineEnd, onPuzzleWrap, until } = options || {};

  if (until) {
    return moveOnGridUntil(options.until, start, direction, gridSize, {
      atLineEnd,
      onPuzzleWrap
    });
  }

  const vector = direction; // TODO make direction a string & look up vector
  const onGrid = position => vectorFits(position, gridSize);
  const wrap = position => vectorMod(position, gridSize);

  const unwrapped = vectorAdd(start, vector);
  if (onGrid(unwrapped)) return unwrapped;
  if (atLineEnd === STOP) return start;

  const wrapped = wrap(unwrapped);
  if (atLineEnd !== NEXT_LINE) return wrapped;

  const crossVector = vector.slice().reverse();
  const lineAdvanced = vectorAdd(wrapped, crossVector);
  if (onGrid(lineAdvanced)) return lineAdvanced;

  const puzzleWrapped = wrap(lineAdvanced);
  if (onPuzzleWrap) onPuzzleWrap();
  return puzzleWrapped;
}

export function moveOnGridUntil(found, start, direction, gridSize, options) {
  let position = start,
    lastPosition;
  do {
    lastPosition = position;
    position = moveOnGrid(position, direction, gridSize, options);
  } while (
    !found(position) && // haven't fulfilled condition
    !_.isEqual(position, lastPosition) && // still moving
    !_.isEqual(position, start) // not back where we started
  );
  return position;
}

// returns true if cell at cursor starts a word in direction
//    grid: a two d array of cells, where black cells have a true property isBlack
export function isWordStart(cursor, direction, grid) {
  const vector = direction; // TODO make direction a string & look up vector
  const cell = getElement(grid, cursor),
    oneBack = getElement(grid, vectorSubtract(cursor, vector));
  return cell && !cell.isBlack && (!oneBack || !!oneBack.isBlack);
}

export function moveToNextWord(start, direction, grid) {
  /*
  const word = this.word;
  if (!word) return;
  const wordEdge = _.isEqual(this.direction, ACROSS)
    ? word[word.length - 1]
    : word[0];
  const gridSize = [this.height, this.width];
  let direction = this.direction;
  newPos = moveOnGrid(wordEdge, LEFT, gridSize, {
    atLineEnd: NEXT_LINE,
    onPuzzleWrap: () => {
      direction = direction.slice().reverse();
    },
    until: pos => isWordStart(pos, direction, grid)
  });
  this.setCursor(...newPos);
  this.direction = direction;
*/
}

/*
function whichClue(grid, width, numbers, k, direction) {
  if (isBlack(grid, k)) return null;
  if (isStartCell(grid, width, k, direction)) return numbers[k];
  var backOne = k - (direction === ACROSS ? 1 : width);
  return whichClue(grid, width, numbers, backOne, direction);
}

function getClue(grid, width, numbers, clues, k, direction) {
  var n = whichClue(grid, width, numbers, k, direction);
  return _.find(clues, { number: n, direction: direction });
}

function isSolved(puzzle, checkBlacks) {
  for (var k = 0; k < puzzle.solution.length; k++) {
    if (isBlack(puzzle.solution, k)) {
      if (checkBlacks && !isBlack(puzzle.guesses, k)) return false;
    } else {
      if (puzzle.guesses[k] !== puzzle.solution[k]) return false;
    }
  }
  return true;
}
*/
