import React, { Component } from "react";
import { observer } from "mobx-react";
import _ from "lodash";
import PuzzleCell from "./puzzleCell";
import { LEFT, RIGHT, UP, DOWN } from "../services/xwdService";

const SET_CURSOR = "setCursor",
  SET_DIRECTION = "setDirection",
  SET_BLACK = "setBlack",
  SET_CONTENT = "setContent",
  SET_NUMBER = "setNumber";

class PuzzleGrid extends Component {
  keyDownHandler = this.handleKeyDown.bind(this);
  actionStack = [];

  componentDidMount() {
    window.addEventListener("keydown", this.keyDownHandler);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.keyDownHandler);
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
    console.log("keyCode", keyCode, "which", event.which, "key", event.key);

    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const keys = {
      37: () => this.handleArrow(LEFT), // arrow left
      38: () => this.handleArrow(UP), // arrow up
      39: () => this.handleArrow(RIGHT), // arrow right
      40: () => this.handleArrow(DOWN), // arrow down
      190: () => this.toggleBlack(), // . (period)
      32: () => this.handleAlpha(""), // space
      8: () => this.handleBackspace() //
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

  advanceCursor() {
    this.moveCursor(...this.props.grid.direction);
  }

  moveCursor(i, j) {
    this.setCursor(...this.props.grid.addToCursor(i, j));
  }

  handleArrow(direction) {
    const [i, j] = direction;
    const [down, across] = this.props.grid.direction;
    if ((across && i) || (down && j)) {
      this.toggleDirection();
    } else {
      this.moveCursor(i, j); // to record action
    }
  }

  handleDigit(d) {
    const cell = this.props.grid.currentCell;
    cell.number =
      "" + (this.lastAction.name === SET_NUMBER ? cell.number : "") + d;
    if (cell.number === "0") cell.number = ""; // delete if 0
    this.recordAction(SET_NUMBER, cell.number);
  }

  handleAlpha(a) {
    this.props.grid.currentCell.content = a;
    this.recordAction(SET_CONTENT, a);
    this.advanceCursor();
  }

  handleBackspace() {
    if (this.lastAction.name === SET_NUMBER) {
      const cell = this.props.grid.currentCell;
      if (cell.number && cell.number.length) {
        cell.number = cell.number.slice(0, -1); // all but last letter
        this.recordAction(SET_NUMBER, cell.number);
      }
    } else {
      const [i, j] = this.props.grid.direction;
      this.moveCursor(-i, -j);
      this.props.grid.currentCell.content = "";
      this.recordAction(SET_CONTENT, "");
    }
  }

  toggleBlack() {
    const cell = this.props.grid.currentCell;
    cell.toggleBlack();
    this.recordAction(SET_BLACK, cell.isBlack);
    //this.advanceCursor();
  }

  toggleDirection() {
    this.props.grid.toggleDirection();
    this.recordAction(SET_DIRECTION, this.props.grid.direction.slice());
  }

  setCursor(row, col) {
    this.props.grid.cursor = [row, col];
    this.recordAction(SET_CURSOR, this.props.grid.cursor.slice());
  }

  // TODO suppress word select on double click (prevent default isn't doing it)
  handleCellClick(row, col, event) {
    if (this.props.grid.cursorIsAt(row, col)) {
      this.toggleDirection();
    } else {
      this.setCursor(row, col);
    }
    event.preventDefault();
  }

  // MARK: helper function for render

  rowKey(row) {
    return "row " + row;
  }

  cellKey(row, col) {
    return "cell " + row + ", " + col;
  }

  cursorSettings(row, col) {
    const grid = this.props.grid;
    return {
      cell: grid.cursorIsAt(row, col),
      word: grid.wordContains(row, col)
    };
  }

  render() {
    const grid = this.props.grid;
    if (grid.length === 0) return null;
    return (
      <div className="puzzle-board">
        <div className="grid puzzle-board-content">
          <table id="board" tabIndex="0">
            <tbody>
              {_.range(0, grid.height).map(row => (
                <tr key={this.rowKey(row)}>
                  {_.range(0, grid.width).map(col => (
                    <PuzzleCell
                      key={this.cellKey(row, col)}
                      cell={grid.cell(row, col)}
                      cursor={this.cursorSettings(row, col)}
                      onClick={event => this.handleCellClick(row, col, event)}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

observer(PuzzleGrid);

export default PuzzleGrid;
