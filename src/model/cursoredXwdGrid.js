import XwdGrid from "./xwdGrid";
import _ from "lodash";
import { decorate, observable, action, computed } from "mobx";
import { getWord } from "../services/xwdService";
import { mod } from "../services/common/utils";

class CursoredXwdGrid extends XwdGrid {
  cursor = [0, 0];
  direction = [0, 1]; // across

  handleArrow(i, j) {
    const [down, across] = this.direction;
    if ((across && i) || (down && j)) {
      this.toggleDirection();
    } else {
      const { width, height } = this;
      const [row, col] = this.cursor;
      console.log({ width, height, row, col, i, j });
      console.log("this.cursor", this.cursor);
      console.log("setting cursor to", [
        mod(row + i, height),
        mod(col + j, width)
      ]);
      this.cursor = [mod(row + i, height), mod(col + j, width)];
    }
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

  cursorAt(row, col) {
    return _.isEqual([row, col], this.cursor);
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
