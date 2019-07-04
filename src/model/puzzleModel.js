import _ from "lodash";
import CursoredXwdGrid from "./cursoredXwdGrid";
import { ACROSS, puzzleFromFileData } from "../services/xwdService";

class PuzzleModel {
  constructor(data) {
    this.data = data;
    this.grid = new CursoredXwdGrid(data.height, data.width);
    this.grid.allCells((cell, { pos }) => {
      cell.solution = data.solution[pos];
    });
    if (data.user) {
      this.grid.setContents(data.user.contents);
      this.grid.setNumbers(data.user.numbers);
      if (data.user.blacks) this.grid.setBlacks(data.user.blacks);
    }
  }

  isSolved() {
    let solved = true;
    this.grid.allCells(cell => {
      if (cell.solution === ":" || cell.solution === ".") {
        if (!cell.isBlack) solved = false;
      } else {
        if (cell.content !== cell.solution) solved = false;
      }
    });
    return solved;
  }

  directionIs(direction) {
    return _.isEqual(direction, this.grid.direction);
  }

  calculateCurrentClue() {
    const grid = this.grid,
      puz = this.data;
    this.currentClue = {};
    // TODO grid should guarantee no 0 length words
    if (grid.word && grid.word.length) {
      const number = grid.cell(...grid.word[0]).number,
        dir = this.directionIs(ACROSS) ? "A" : "D";
      const clue = _.find(
        puz.clues,
        clue =>
          clue.number + "" === number + "" && this.directionIs(clue.direction)
      );
      this.currentClue = clue ? { number: number + dir, text: clue.clue } : {};
    }
  }

  serialize() {
    this.data.user = this.grid.serialize();
    return this.data;
  }

  static deserialize(data) {
    // TODO check for integrity of puzzle data & fail gracefully
    return data ? new PuzzleModel(data) : null;
  }

  static fromFileData(arrayBuffer) {
    const data = puzzleFromFileData(arrayBuffer);
    return data ? new PuzzleModel(data) : null;
  }
}

export default PuzzleModel;
