import _ from "lodash";
import CursoredXwdGrid from "./cursoredXwdGrid";
import { ACROSS, puzzleFromFileData } from "../services/xwdService";

class PuzzleModel {
  // TODO read clues from data so they can be more easily accessed by number/direction
  constructor(data) {
    this.data = data;
    this.grid = new CursoredXwdGrid(data.height, data.width);
    this.grid.forEachCell((cell, { pos }) => {
      const answer = data.solution[pos];
      cell.solution = {
        content: answer,
        isBlack: answer === ":" || answer === ".",
        number: data.numbers[pos]
      };
    });
    if (data.user) {
      this.grid.setData(data.user);
    }
  }

  get isSolved() {
    return this.grid.isSolved;
  }

  get isFilled() {
    return this.grid.isFilled;
  }

  directionIs(direction) {
    return _.isEqual(direction, this.grid.direction);
  }

  calculateCurrentClue() {
    const grid = this.grid,
      puz = this.data;
    this.currentClue = {};
    if (grid.word) {
      const number = grid.cell(...grid.word[0]).number,
        dir = this.directionIs(ACROSS) ? "A" : "D",
        clue = _.find(
          puz.clues,
          clue =>
            clue.number + "" === number + "" && this.directionIs(clue.direction)
        );
      this.currentClue = clue ? { number: number + dir, text: clue.clue } : {};
      this.calculateRelatedClues();
    }
  }

  calculateRelatedClues() {
    const regex = /\d+-(Across|Down)/gi;
    this.relatedClues = (this.currentClue.text.match(regex) || []).map(name =>
      name.toLowerCase()
    );
    this.relatedCells = this.relatedClues
      .map(wordName => this.grid.getCellsInNamedWord(wordName))
      .flat();
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
