import XwdGrid from "./xwdGrid";
import _ from "lodash";
import { decorate, observable, action, computed } from "mobx";
import {
  ACROSS,
  DOWN,
  LEFT,
  RIGHT,
  NEXT_LINE,
  moveOnGrid,
  getWord
} from "../services/xwdService";
import { mod, includesEqual } from "../services/common/utils";

console.debug('CursoredXwdGrid loaded');

class CursoredXwdGrid extends XwdGrid {
  cursor = [0, 0];
  direction = RIGHT; // across
  
  get currentCell() {
    return this.cell(...this.cursor);
  }

  get word() {
    return getWord(this.grid, this.cursor, this.direction);
  }

  get crossingWord() {
    return getWord(this.grid, this.cursor, this.direction.slice().reverse());
  }

  cursorIsAt(row, col) {
    return _.isEqual([row, col], this.cursor);
  }

  wordContains(row, col) {
    return includesEqual(this.word, [row, col]);
  }

  toggleDirection() {
    this.direction = this.direction.slice().reverse();
  }

  addToCursor(i, j) {
    const { width, height } = this;
    const [row, col] = this.cursor;
    return [mod(row + i, height), mod(col + j, width)];
  }

  directionIs(direction) {
    return _.isEqual(direction, this.direction);
  }

  clueNumber(direction) {
    const word = this.directionIs(direction) ? this.word : this.crossingWord;
    return word && word.length ? this.cell(...word[0]).number : "";
  }

  setCursor(row, col) {
    this.cursor = [row, col];
  }

  setPosition(pos) {
    const width = this.width;
    this.setCursor(Math.floor(pos / width), pos % width);
  }

  goToWord(number, direction) {
    const pos = this.grid.flat().findIndex(cell => cell.number === number);
    if (pos >= 0) {
      this.setPosition(pos);
      this.direction = direction;
    }
  }

  goToNextWord(options = {}) {
    const backward = !!options.backward,
      eitherDirection = !!options.eitherDirection,
      word = this.word,
      start = eitherDirection || !word ? this.cursor : word[0],
      gridSize = [this.height, this.width];
    let direction = this.direction;
    const startOfWord = moveOnGrid(start, backward ? LEFT : RIGHT, gridSize, {
      atLineEnd: NEXT_LINE,
      onPuzzleWrap: () => {
        direction = _.isEqual(direction, ACROSS) ? DOWN : ACROSS;
      },
      until: pos =>
        this.wordStartsAt(...pos, eitherDirection ? null : direction)
    });
    // TODO DRY this out there's similar in puzzle.jsx moveInWord(grid, policy, word)
    const newWord = getWord(this.grid, startOfWord, direction);
    const emptyCell = _.find(newWord, pos => !this.cell(...pos).content);
    const newPos = emptyCell || newWord[0];
    //console.log({ newWord, emptyCell, newPos });
    this.setCursor(...newPos);
    this.direction = direction;
    if (!emptyCell && options.skipFilled && !this.isFilled) {
      this.goToNextWord(options);
    }
  }

  cursorShadowFallsOn(row, col) {
    return _.isEqual(this.direction, ACROSS)
      ? row === this.cursor[0]
      : col === this.cursor[1];
  }
}

decorate(CursoredXwdGrid, {
  constructor: action,
  cursor: observable,
  direction: observable,
  currentCell: computed,
  word: computed,
  handleArrow: action,
  toggleDirection: action
});

export default CursoredXwdGrid;
