import XwdCell from "./xwdCell";
import _ from "lodash";

class XwdGrid {
  grid = [];

  constructor(height, width) {
    this.grid = _.times(height, () => _.times(width, () => new XwdCell()));
  }

  get height() {
    return this.grid.length;
  }

  get width() {
    return this.height ? this.grid[0].length : 0;
  }

  cell(row, col) {
    return this.grid[row][col];
  }

  // takes an array of strings
  setContents(data) {
    const { height, width, grid } = this;
    if (data.length !== height * width)
      throw "Crossword data is the wrong size"; // TODO throw error object
    _.range(0, height).forEach(row => {
      _.range(0, width).forEach(col => {
        const pos = row * width + col;
        if (data[pos] === "." || data[pos] === ":") {
          grid[row][col].isBlack = true;
        } else {
          grid[row][col].content = data[pos];
        }
      });
    });
  }

  setNumbers(data) {
    const { height, width, grid } = this;
    _.range(0, height).forEach(row => {
      _.range(0, width).forEach(col => {
        const pos = row * width + col;
        grid[row][col].number = data[pos] || "";
      });
    });
  }

  toString() {
    return this.grid
      .map(row => row.map(cell => cell.content).join(""))
      .join("\n");
  }
}

export default XwdGrid;
