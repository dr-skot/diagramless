import React, { Component } from "react";
import { observer } from "mobx-react";
import _ from "lodash";
import PuzzleCell from "./puzzleCell";
import { includesEqual } from "../services/common/utils";
import CursoredXwdGrid from "../model/cursoredXwdGrid";

const SET_CURSOR = "setCursor",
  SET_DIRECTION = "setDirection",
  SET_BLACK = "setBlack",
  SET_CONTENT = "setContent",
  SET_NUMBER = "setNumber";

class PuzzleGrid extends Component {
  state = {
    width: 5,
    height: 5,
    grid: [],
    cursor: [1, 1],
    direction: [1, 0],
    word: []
  };
  grid = new CursoredXwdGrid(5, 5);
  actionStack = [];

  componentDidMount() {
    const { width, height } = this.state;
    this.grid = new CursoredXwdGrid(5, 5);
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

  recordAction(name, ...args) {
    this.actionStack.unshift({ name, args });
  }

  get lastAction() {
    if (this.actionStack.length === 0) return {};
    return this.actionStack[0];
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
    let shouldPreventDefault = true;

    const keyAction = keys[event.keyCode];
    if (keyAction) {
      keyAction();
    } else if (_.inRange(keyCode, 48, 57 + 1)) {
      // digits
      this.handleDigit(keyCode - 48);
    } else if (_.inRange(keyCode, 58, 90 + 1)) {
      // alpha
      this.handleAlpha(String.fromCharCode(keyCode));
    } else {
      shouldPreventDefault = false;
    }

    if (shouldPreventDefault) event.preventDefault();
  }

  moveCursor(i, j) {
    // TODO move handle arrow here and separate setDirection from setCursor
    this.grid.handleArrow(i, j);
    this.recordAction(SET_DIRECTION, this.grid.direction.slice());
    this.recordAction(SET_CURSOR, this.grid.cursor.slice());
  }

  advanceCursor() {
    this.moveCursor(...this.grid.direction);
  }

  handleDigit(d) {
    const cell = this.grid.currentCell;
    cell.number =
      "" + (this.lastAction.name === SET_NUMBER ? cell.number : "") + d;
    this.recordAction(SET_NUMBER, cell.number);
  }

  handleAlpha(a) {
    this.grid.currentCell.content = a;
    this.recordAction(SET_CONTENT, a);
    this.advanceCursor();
  }

  toggleBlack() {
    const cell = this.grid.currentCell;
    cell.toggleBlack();
    this.recordAction(SET_BLACK, cell.isBlack);
    this.advanceCursor();
  }

  inFocus(row, col) {
    return includesEqual(this.grid.word, [row, col]);
  }

  toggleDirection() {
    this.grid.toggleDirection();
    this.recordAction(SET_DIRECTION, this.grid.direction.slice());
  }

  cursorAt(i, j) {
    return _.isEqual([i, j], this.grid.cursor);
  }

  setCursor(row, col) {
    this.grid.cursor = [row, col];
    this.recordAction(SET_CURSOR, this.grid.cursor.slice());
  }

  handleCellClick(row, col) {
    if (this.cursorAt(row, col)) {
      this.toggleDirection();
    } else {
      this.setCursor(row, col);
    }
  }

  rowKey(row) {
    return "row " + row;
  }

  cellKey(row, col) {
    return "cell " + row + ", " + col;
  }

  render() {
    const grid = this.grid;
    if (grid.length === 0) return null;
    return (
      <div className="grid">
        <table id="board" tabIndex="0">
          <tbody>
            {_.range(0, grid.height).map(row => (
              <tr key={this.rowKey(row)}>
                {_.range(0, grid.width).map(col => (
                  <PuzzleCell
                    key={this.cellKey(row, col)}
                    content={this.grid.cell(row, col).content}
                    number={this.grid.cell(row, col).number}
                    settings={{
                      cursor: this.cursorAt(row, col),
                      black: this.grid.cell(row, col).isBlack,
                      focus: this.inFocus(row, col)
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
