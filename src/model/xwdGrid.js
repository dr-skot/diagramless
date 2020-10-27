import _ from "lodash";
import { ACROSS, DOWN, isWordStart, getWord } from "../services/xwdService";
import XwdCell from "./xwdCell";
import { observe, decorate, observable, action } from "mobx";

// Symmetry constants
export const DIAGONAL = "DIAGONAL",
  LEFT_RIGHT = "LEFT_RIGHT";

class XwdGrid {
  grid = [];
  symmetry = null;

  constructor(height, width, data) {
    console.debug('XwdGrid.constructor');
    this._initialize(height, width, data);
  }

  _initialize(height, width, data) {
    console.debug('XwdGrid._initialize');
    this.grid = _.times(height, () => _.times(width, () => new XwdCell()));
    if (data) this.setData(data);

    this.disposers = [];
    this.forEachCell((cell, { row, col }) => {
      this.disposers.push(
        observe(cell, "isBlack", change =>
          this.onBlackChange(cell, row, col, change)
        )
      );
    });

    console.debug('XwdGrid._initialize: done');
    return this;
  }

  revealDiagram() {
    this.forEachCell(cell => {
      cell.isBlack = cell.solution.isBlack;
      cell.number = cell.solution.number;
      cell.circle = cell.solution.circle;
    });
  }

  revealCircles() {
    this.forEachCell(cell => {
      cell.circle = cell.solution.circle;
    });
  }

  onBlackChange = (cell, row, col, change) => {
    if (this.symmetry) {
      const sister = this.getSisterCell(row, col, this.symmetry);
      if (sister.isBlack !== cell.isBlack) sister.isBlack = cell.isBlack;
    }
    if (this.autonumbering) this.numberWordStarts();
  };

  getSisterCell(row, col, symmetry) {
    const { height, width } = this;
    const sisterLocation = {
      DIAGONAL: [height - row - 1, width - col - 1],
      LEFT_RIGHT: [row, width - col - 1]
    }[symmetry];
    return sisterLocation ? this.cell(...sisterLocation) : null;
  }

  setSymmetry(symmetry) {
    const oldSymmetry = this.symmetry;
    this.symmetry = null;
    if (oldSymmetry) this.undoSymmetry(oldSymmetry);
    if (symmetry !== oldSymmetry) {
      this.enforceSymmetry(symmetry);
      this.symmetry = symmetry;
    }
  }

  toggleAutonumbering() {
    this.autonumbering = !this.autonumbering;
    if (this.autonumbering) this.numberWordStarts();
  }

  get height() {
    return this.grid.length;
  }

  get width() {
    return this.height ? this.grid[0].length : 0;
  }

  word(row, col, direction) {
    return getWord(this.grid, [row, col], direction);
  }

  clueNumber(row, col, direction) {
    const word = this.word(row, col, direction);
    return word && this.cell(...word[0]).number;
  }

  get isFilled() {
    return !this.grid.flat().find(cell => !cell.isBlack && !cell.content);
  }

  get isSolved() {
    return !this.grid.flat().find(cell => !cell.isCorrect());
  }

  cell(row, col) {
    return this.grid[row][col];
  }

  wordStartsAt(row, col, direction) {
    if (!direction)
      return (
        this.wordStartsAt(row, col, ACROSS) || this.wordStartsAt(row, col, DOWN)
      );
    return isWordStart([row, col], direction, this.grid);
  }

  getWordStarts(number, direction) {
    const wordStarts = [];
    this.forEachCell((cell, { row, col }) => {
      if (cell.number === number && this.wordStartsAt(row, col, direction)) {
        wordStarts.push([row, col]);
      }
    });
    return wordStarts;
  }

  getCellsInWord(wordLocator) {
    const { number, direction } = wordLocator;
    return this.getWordStarts(number, direction)
      .map(location => getWord(this.grid, location, direction))
      .flat();
  }

  numberWordStarts() {
    let counter = 0;
    this.forEachCell((cell, { row, col }) => {
      if (this.wordStartsAt(row, col)) {
        counter += 1;
        cell.number = counter + "";
      }
    });
  }

  enforceSymmetry(symmetryType) {
    const { height, width } = this;
    this.forEachCell((cell, { row, col }) => {
      // ignore cells set black by enforce symmetry by requiring true not truthy
      if (cell.isBlack === true) {
        const sisterCell = {
          DIAGONAL: [height - row - 1, width - col - 1],
          LEFT_RIGHT: [row, width - col - 1]
        }[symmetryType];
        if (sisterCell) this.cell(...sisterCell).isBlack = symmetryType;
      }
    });
  }

  undoSymmetry(symmetryType) {
    this.forEachCell(cell => {
      if (cell.isBlack === symmetryType) cell.isBlack = false;
    });
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
    if (data.cells) this.setCells(data.cells);
  }

  // takes an array of strings
  setContents(data) {
    this.forEachCell((cell, { pos }) => {
      if (data[pos] === "." || data[pos] === ":") {
        cell.isBlack = true;
      } else {
        cell.content = data[pos] || "";
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

  setCells(data) {
    this.forEachCell((cell, { pos }) => {
      Object.assign(cell, data[pos]);
    });
  }

  serialize() {
    return {
      cells: this.grid.flat()
    };
  }

  toString() {
    return this.grid
      .map(row => row.map(cell => cell.content).join(""))
      .join("\n");
  }
}

decorate(XwdGrid, {
  _initialize: action,
  grid: observable
});

export default XwdGrid;
