import XwdCell from "./xwdCell";
import _ from "lodash";

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

  cell(row, col) {
    return this.grid[row][col];
  }

  allCells(callback) {
    const { width, height } = this;
    _.range(0, height).forEach(row => {
      _.range(0, width).forEach(col => {
        const pos = row * width + col;
        callback(this.grid[row][col], { row, col, pos });
      });
    });
  }

  setData(data) {
    console.log("setting data");
    const { height, width, grid } = this;
    const { contents, numbers } = data;
    _.range(0, height).forEach(row => {
      _.range(0, width).forEach(col => {
        const pos = row * width + col;
        const cell = grid[row][col];
        if (contents) {
          if (contents[pos] === "." || contents[pos] === ":") {
            cell.isBlack = true;
          } else {
            cell.content = contents[pos] || "";
          }
        }
        if (numbers) grid[row][col].number = numbers[pos] || "";
      });
    });
  }

  // takes an array of strings
  setContents(data) {
    const { height, width, grid } = this;
    _.range(0, height).forEach(row => {
      _.range(0, width).forEach(col => {
        const pos = row * width + col;
        if (data[pos] === "." || data[pos] === ":") {
          grid[row][col].isBlack = true;
        } else {
          grid[row][col].content = data[pos] || "";
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

  setBlacks(data) {
    const { height, width, grid } = this;
    _.range(0, height).forEach(row => {
      _.range(0, width).forEach(col => {
        const pos = row * width + col;
        grid[row][col].isBlack = data[pos] || false;
      });
    });
  }

  serialize() {
    const { height, width, grid } = this;
    const data = {
      numbers: [],
      contents: [],
      blacks: []
    };
    _.range(0, height).forEach(row => {
      _.range(0, width).forEach(col => {
        const pos = row * width + col;
        data.numbers[pos] = grid[row][col].number;
        data.contents[pos] = grid[row][col].content;
        data.blacks[pos] = grid[row][col].isBlack;
      });
    });
    return data;
  }

  toString() {
    return this.grid
      .map(row => row.map(cell => cell.content).join(""))
      .join("\n");
  }
}

export default XwdGrid;
