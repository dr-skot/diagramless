import React, { Component } from "react";
import { observer } from "mobx-react";
import _ from "lodash";
import PuzzleCell from "./puzzleCell";
import { includesEqual } from "../services/common/utils";
import CursoredXwdGrid from "../model/cursoredXwdGrid";

const SET_CURSOR = "setCursor",
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

  actions = {
    handleAlpha: this.handleAlpha.bind(this),
    handleDigit: this.handleDigit.bind(this),
    moveCursor: this.moveCursor.bind(this),
    toggleBlack: this.toggleBlack.bind(this),
    setCursor: this.setCursor.bind(this),
    toggleDirection: this.toggleDirection.bind(this)
  };

  doAction(action, ...args) {
    this.actions[action](...args);
    this.actionStack.unshift({ action, args });
  }

  get lastAction() {
    if (this.actionStack.length === 0) return {};
    return this.actionStack[0];
  }

  handleKeyDown(event) {
    const keyCode = event.keyCode;
    //console.log("keyCode", keyCode);
    const keys = {
      37: ["moveCursor", 0, -1], // arrow left
      38: ["moveCursor", -1, 0], // arrow up
      39: ["moveCursor", 0, 1], // arrow right
      40: ["moveCursor", 1, 0], // arrow down
      190: ["toggleBlack"] // . (period)
    };
    let shouldPreventDefault = true;

    const keyAction = keys[event.keyCode];
    const doAction = this.doAction.bind(this);
    if (keyAction) {
      doAction(...keyAction);
    } else if (_.inRange(keyCode, 48, 57 + 1)) {
      // digits
      doAction("handleDigit", keyCode - 48);
    } else if (_.inRange(keyCode, 58, 90 + 1)) {
      // alpha
      doAction("handleAlpha", String.fromCharCode(keyCode));
    } else {
      shouldPreventDefault = false;
    }

    if (shouldPreventDefault) event.preventDefault();
  }

  handleDigit(d) {
    const cell = this.grid.currentCell;
    const lastAction = this.lastAction.action;
    console.log("lastAction", lastAction);
    cell.number = "" + (lastAction === "handleDigit" ? cell.number : "") + d;
  }

  handleAlpha(a) {
    this.grid.currentCell.content = a;
    this.moveCursor(...this.grid.direction);
  }

  toggleBlack() {
    this.grid.currentCell.toggleBlack();
    this.moveCursor(...this.grid.direction);
  }

  inFocus(row, col) {
    return includesEqual(this.grid.word, [row, col]);
  }

  moveCursor(i, j) {
    console.log("moveCursor!", i, j);
    this.grid.handleArrow(i, j);
  }

  toggleDirection() {
    this.grid.toggleDirection();
  }

  cursorAt(i, j) {
    return _.isEqual([i, j], this.grid.cursor);
  }

  setCursor(row, col) {
    this.grid.cursor = [row, col];
  }

  handleCellClick(row, col) {
    const action = this.cursorAt(row, col)
      ? ["toggleDirection"]
      : ["setCursor", row, col];
    this.doAction(...action);
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
