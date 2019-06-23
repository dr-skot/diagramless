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
}

export default XwdGrid;
