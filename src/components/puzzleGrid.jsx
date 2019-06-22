import React, { Component } from "react";
import _ from "lodash";
import PuzzleCell from "./puzzleCell";

class PuzzleGrid extends Component {
  state = {
    width: 5,
    height: 5,
    grid: [],
    cursor: [1, 1]
  };

  mod(m, n) {
    return ((m % n) + n) % n;
  }

  componentDidMount() {
    const { width, height } = this.state;
    const grid = _.range(0, height).map(row =>
      _.range(0, width).map(col => {
        return { guess: " " };
      })
    );
    this.setState({ grid });
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(event) {
    const keyCode = event.keyCode;
    console.log("keyCode", keyCode);
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
    const cell = this.cloneCell();
    cell.number = d;
    this.updateCell(cell);
  }

  handleAlpha(a) {
    const cell = this.cloneCell();
    cell.guess = a;
    this.updateCell(cell);
  }

  toggleBlack() {
    const cell = this.cloneCell();
    cell.isBlack = !cell.isBlack;
    this.updateCell(cell);
  }

  moveCursor(i, j) {
    const mod = this.mod;
    const { width, height } = this.state;
    const [row, col] = this.state.cursor;
    const cursor = [mod(row + i, height), mod(col + j, width)];
    this.setState({ cursor });
  }

  cursorAt(i, j) {
    return _.isEqual([i, j], this.state.cursor);
  }

  setCursor(i, j) {
    this.setState({ cursor: [i, j] });
  }

  rowKey(row) {
    return "row " + row;
  }

  cellKey(row, col) {
    return "cell " + row + ", " + col;
  }

  render() {
    const { grid, height, width } = this.state;
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
                    content={grid[row][col].guess}
                    number={grid[row][col].number}
                    settings={{
                      cursor: this.cursorAt(row, col),
                      black: grid[row][col].isBlack
                    }}
                    onClick={() => this.setCursor(row, col)}
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

export default PuzzleGrid;
