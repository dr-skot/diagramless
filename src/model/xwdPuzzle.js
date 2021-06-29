import _ from "lodash";
import CursoredXwdGrid from "./cursoredXwdGrid";
import {
  ACROSS,
  puzzleFromFileData,
  parseRelatedClues
} from "../services/xwdService";
import { decorate, action } from "mobx";

class XwdPuzzle {
  clock = {
    time: 0,
    isRunning: true
  };

  constructor(data) {
    this._initialize(data);
  }

  // TODO read clues from data so they can be more easily accessed by number/direction
  _initialize(data) {
    this.data = data;
    this.grid = new CursoredXwdGrid(data.height, data.width);
    this.grid.forEachCell((cell, { pos }) => {
      const answer = data.solution[pos];
      cell.solution = {
        content: answer,
        isBlack: answer === ":" || answer === ".",
        number: (data.numbers[pos] || "") + "",
        circle: data.extras.GEXT && (data.extras.GEXT[pos] & 0x80) === 0x80
      };
    });
    if (data.user) {
      this.grid.setData(data.user);
    }
    if (data.clock) {
      this.clock = data.clock;
    }
    if (data.cursor) {
      console.log('got cursor:', data.cursor);
      this.grid.setCursor(data.cursor[0], data.cursor[1]);
    }
    if (data.direction) {
      this.grid.direction = data.direction;
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
          clue => clue.number === number && this.directionIs(clue.direction)
        );
      this.currentClue = clue ? { number: number + dir, text: clue.clue } : {};
    }
    this.calculateRelatedClues();
  }

  // TODO lose this named word thing and store clues as {number, direction}
  calculateRelatedClues() {
    this.relatedClues = parseRelatedClues(this.currentClue.text || "");
    this.relatedCells = this.relatedClues
      .map(wordLocator => this.grid.getCellsInWord(wordLocator))
      .flat();
  }

  serialize() {
    this.data.user = this.grid.serialize();
    this.data.clock = this.clock;
    this.data.cursor = this.grid.cursor;
    this.data.direction = this.grid.direction;
    return this.data;
  }

  static deserialize(data) {
    // TODO check for integrity of puzzle data & fail gracefully
    return data ? new XwdPuzzle(data) : null;
  }

  static fromFileData(arrayBuffer) {
    console.debug('XwdPuzzle.fromFileData');
    const data = puzzleFromFileData(arrayBuffer);
    console.debug('got data', data);
    return data ? new XwdPuzzle(data) : null;
  }

  static fromLocalStorage(key) {
    const puzzleData = JSON.parse(localStorage.getItem(key));
    return XwdPuzzle.deserialize(puzzleData);
  }
}

decorate(XwdPuzzle, {
  _initialize: action
});

export default XwdPuzzle;
