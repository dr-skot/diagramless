import XwdGrid from "./xwdGrid";
import _ from "lodash";
import { decorate, observable, action, computed } from "mobx";
import { getWord } from "../services/xwdService";
import { mod } from "../services/common/utils";

class CursoredXwdGrid extends XwdGrid {
  cursor = [0, 0];
  direction = [0, 1]; // across

  cursorIsAt(row, col) {
    return _.isEqual([row, col], this.cursor);
  }

  addToCursor(i, j) {
    const { width, height } = this;
    const [row, col] = this.cursor;
    return [mod(row + i, height), mod(col + j, width)];
  }

  toggleDirection() {
    this.direction = this.direction.slice().reverse();
  }

  get word() {
    console.log("word: cursor =", this.cursor.slice());
    return getWord(this.grid, this.cursor, this.direction);
  }

  get currentCell() {
    return this.cell(...this.cursor);
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
