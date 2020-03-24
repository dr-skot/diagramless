import React, { Component } from "react";
import { observer } from "mobx-react";
import _ from "lodash";
import PuzzleCell from "./puzzleCell";

class PuzzleGrid extends Component {
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
      word: this.cellFoundInList(row, col, grid.word),
      related: this.cellFoundInList(row, col, this.props.relatedCells),
      shadow: grid.currentCell.isBlack && grid.cursorShadowFallsOn(row, col)
    };
  }

  cellFoundInList(row, col, list) {
    return _.find(list, location => _.isEqual(location, [row, col]));
  }

  // only show number at start of word
  cell(row, col) {
    const grid = this.props.grid,
      cell = grid.cell(row, col);
    return !cell.number || grid.wordStartsAt(row, col)
      ? cell
      : { ...cell, number: "" };
  }

  render() {
    console.log("render puzzleGrid");
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
                      cell={this.cell(row, col)}
                      cursor={this.cursorSettings(row, col)}
                      onClick={event => this.props.onCellClick(row, col, event)}
                      width={this.props.cellWidth}
                      cursorRef={this.props.cursorRef}
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
