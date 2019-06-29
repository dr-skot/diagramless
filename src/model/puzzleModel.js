import _ from "lodash";
import CursoredXwdGrid from "./cursoredXwdGrid";
import { ACROSS } from "../services/xwdService";

class PuzzleModel {
  constructor(data) {
    this.data = data;
    this.grid = new CursoredXwdGrid(data.width, data.height);
    if (data.user) {
      this.grid.setContents(data.user.contents);
      this.grid.setNumbers(data.user.numbers);
      if (data.user.blacks) this.grid.setBlacks(data.user.blacks);
    }
  }

  directionIs(direction) {
    return _.isEqual(direction, this.grid.direction);
  }

  calculateCurrentClue() {
    console.log("this.grid", this.grid);
    const grid = this.grid,
      puz = this.data;
    this.currentClue = {};
    if (grid.word) {
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
}

export default PuzzleModel;
