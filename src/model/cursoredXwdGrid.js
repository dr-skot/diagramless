import XwdGrid from "./xwdGrid";
import _ from "lodash";
import { decorate, observable, action, computed } from "mobx";
import {
  getWord,
  LEFT,
  RIGHT,
  NEXT_LINE,
  moveOnGrid
} from "../services/xwdService";
import { mod, includesEqual } from "../services/common/utils";

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
    const newPos = moveOnGrid(start, backward ? LEFT : RIGHT, gridSize, {
      atLineEnd: NEXT_LINE,
      onPuzzleWrap: () => {
        direction = direction.slice().reverse(); // TODO preserve direction constants
      },
      until: pos =>
        this.wordStartsAt(...pos, eitherDirection ? null : direction)
    });
    this.setCursor(...newPos);
    this.direction = direction;
  }
}

decorate(CursoredXwdGrid, {
  cursor: observable,
  direction: observable,
  currentCell: computed,
  word: computed,
  handleArrow: action,
  toggleDirection: action
});

export default CursoredXwdGrid;
