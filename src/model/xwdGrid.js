import XwdCell from "./xwdCell";
import _ from "lodash";
import { ACROSS, DOWN, isWordStart } from "../services/xwdService";

class XwdGrid {
  grid = [];

  constructor(height, width, data) {
    this.grid = _.times(height, () => _.times(width, () => new XwdCell()));
    if (data) this.setData(data);
  }

  get height() {
    return this.grid.length;
  }

  get width() {
    return this.height ? this.grid[0].length : 0;
  }

  get isFilled() {
    return !this.grid.flat().find(cell => !cell.isBlack && !cell.content);
  }

  cell(row, col) {
    return this.grid[row][col];
  }

  wordStartsAt(row, col, direction) {
    return direction
      ? isWordStart([row, col], direction, this.grid)
      : this.wordStartsAt(row, col, ACROSS) ||
          this.wordStartsAt(row, col, DOWN);
  }

  forEachCell(callback) {
    const { width, height } = this;
    _.range(0, height).forEach(row => {
      _.range(0, width).forEach(col => {
        const pos = row * width + col;
        callback(this.grid[row][col], { row, col, pos });
      });
    });
  }

  setData(data) {
    const { contents, numbers, blacks } = data;
    if (contents) this.setContents(contents);
    if (numbers) this.setNumbers(numbers);
    if (blacks) this.setBlacks(blacks);
  }

  // takes an array of strings
  setContents(data) {
    this.forEachCell((cell, { pos }) => {
      if (data[pos] === "." || data[pos] === ":") {
        cell.isBlack = true;
      } else {
        cell.content = data[pos].trim() || "";
      }
    });
  }

  setNumbers(data) {
    this.forEachCell((cell, { pos }) => {
      cell.number = data[pos] || "";
    });
  }

  setBlacks(data) {
    this.forEachCell((cell, { pos }) => {
      cell.isBlack = data[pos] || false;
    });
  }

  serialize() {
    const cells = this.grid.flat();
    return {
      numbers: cells.map(cell => cell.number),
      contents: cells.map(cell => cell.content),
      blacks: cells.map(cell => cell.isBlack)
    };
  }

  toString() {
    return this.grid
      .map(row => row.map(cell => cell.content).join(""))
      .join("\n");
  }
}

export default XwdGrid;
