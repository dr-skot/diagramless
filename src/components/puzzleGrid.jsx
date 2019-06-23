import React, { Component } from "react";
import { observer } from "mobx-react";
import _ from "lodash";
import PuzzleCell from "./puzzleCell";
import { getWord } from "../services/xwdService";
import { includesEqual } from "../services/common/utils";
import XwdGrid from "../model/xwdGrid";
import { mod } from "../services/common/utils";

class PuzzleGrid extends Component {
  state = {
    width: 5,
    height: 5,
    grid: [],
    cursor: [1, 1],
    direction: [1, 0],
    word: []
  };
  grid = new XwdGrid(5, 5);

  componentDidMount() {
    const { width, height } = this.state;
    this.grid = new XwdGrid(5, 5);
    const grid = _.range(0, height).map(row =>
      _.range(0, width).map(col => {
        return { guess: " " };
      })
    );
    this.setState({ grid, cursor: [0, 0] });
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(event) {
    const keyCode = event.keyCode;
    //console.log("keyCode", keyCode);
    const keys = {
      37: () => this.moveCursor(0, -1), // arrow left
      38: () => this.moveCursor(-1, 0), // arrow up
      39: () => this.moveCursor(0, 1), // arrow right
      40: () => this.moveCursor(1, 0), // arrow down
      190: () => this.toggleBlack() // . (period)
    };
    const fn = keys[event.keyCode];
    let shouldPreventDefault = true;

    if (fn) {
      fn(event);
    } else if (_.inRange(keyCode, 48, 57 + 1)) {
      // digits
      this.handleDigit(keyCode - 48);
      event.preventDefault();
    } else if (_.inRange(keyCode, 58, 90 + 1)) {
      // alpha
      this.handleAlpha(String.fromCharCode(keyCode));
    } else {
      shouldPreventDefault = false;
    }

    if (shouldPreventDefault) event.preventDefault();
  }

  cloneCell() {
    const { grid, cursor } = this.state;
    return { ..._.get(grid, cursor) };
  }

  updateCell(cell) {
    const [row, col] = this.state.cursor;
    const grid = [...this.state.grid];
    grid[row] = [...grid[row]];
    grid[row][col] = cell;
    this.setState({ grid });
  }

  handleDigit(d) {
    this.grid.cell(...this.state.cursor).number = d;
  }

  handleAlpha(a) {
    this.grid.cell(...this.state.cursor).content = a;
    this.moveCursor(...this.state.direction);
  }

  toggleBlack() {
    this.grid.cell(...this.state.cursor).toggleBlack();
    this.moveCursor(...this.state.direction);
    // const cell = this.cloneCell();
    // cell.isBlack = !cell.isBlack;
    // this.updateCell(cell);
  }

  inFocus(row, col) {
    //console.log("focus? word", this.state.word, "pos", [row, col]);
    return includesEqual(this.state.word, [row, col]);
    const [down, across] = this.state.direction;
    const [cursorRow, cursorCol] = this.state.cursor;
    return (across && row === cursorRow) || (down && col === cursorCol);
  }

  moveCursor(i, j) {
    const [down, across] = this.state.direction;
    if ((across && i) || (down && j)) this.toggleDirection();
    else {
      const { width, height } = this.state;
      const [row, col] = this.state.cursor;
      const cursor = [mod(row + i, height), mod(col + j, width)];
      this.setState({ cursor });
    }
  }

  toggleDirection() {
    const { direction } = this.state;
    this.setState({ direction: [direction[1], direction[0]] });
  }

  cursorAt(i, j) {
    return _.isEqual([i, j], this.state.cursor);
  }

  handleCellClick(row, col) {
    if (_.isEqual([row, col], this.state.cursor)) {
      this.toggleDirection();
    } else {
      this.setState({ cursor: [row, col] });
    }
  }

  rowKey(row) {
    return "row " + row;
  }

  cellKey(row, col) {
    return "cell " + row + ", " + col;
  }

  render() {
    const { height, width, cursor, direction } = this.state;
    const grid = this.grid;
    const word = getWord(this.grid.grid, cursor, direction);
    //console.log("grid", grid);
    if (grid.length === 0) return null;
    return (
      <div className="grid">
        <table id="board" tabIndex="0">
          <tbody>
            {_.range(0, height).map(row => (
              <tr key={this.rowKey(row)}>
                {_.range(0, width).map(col => (
                  <PuzzleCell
                    key={this.cellKey(row, col)}
                    content={this.grid.cell(row, col).content}
                    number={this.grid.cell(row, col).number}
                    settings={{
                      cursor: this.cursorAt(row, col),
                      black: this.grid.cell(row, col).isBlack,
                      focus: includesEqual(word, [row, col])
                    }}
                    onClick={() => this.handleCellClick(row, col)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

observer(PuzzleGrid);

export default PuzzleGrid;
