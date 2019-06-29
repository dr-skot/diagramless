import React, { Component } from "react";
import _ from "lodash";
import { ACROSS, DOWN, puzzleFromFileData } from "../services/xwdService";
import PuzzleHeader from "./puzzleHeader";
import PuzzleGrid from "./puzzleGrid";
import ClueBar from "./clueBar";
import ClueList from "./clueList";
import CursoredXwdGrid from "../model/cursoredXwdGrid";
import { observer } from "mobx-react";
import FileDrop from "react-file-drop";

class Puzzle extends Component {
  state = {
    puz: null
  };

  grid = null;

  directionIs(direction) {
    return _.isEqual(direction, this.grid.direction);
  }

  handleDrop = (files, event) => {
    const reader = new FileReader();

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = () => {
      // TODO check for integrity of contents & fail gracefully
      const binaryStr = reader.result;
      const puz = puzzleFromFileData(binaryStr);
      console.log({ puz });
      this.grid = new CursoredXwdGrid(puz.height, puz.width);
      //this.grid.setContents(puz.solution);
      //this.grid.setNumbers(puz.numbers);
      this.setState({ puz });
    };

    reader.readAsArrayBuffer(files[0]);
  };

  componentDidUpdate() {
    const puz = { ...this.state.puz };
    puz.user = this.grid.serialize();
    localStorage.setItem("xword", JSON.stringify(puz));
  }

  componentDidMount() {
    const puz = JSON.parse(localStorage.getItem("xword"));
    console.log("will mount:", puz);
    // TODO check for integrity of puzzle data & fail gracefully
    if (puz) {
      this.grid = new CursoredXwdGrid(puz.height, puz.width);
      if (puz.user) {
        // TODO refactor this serialization to model
        console.log("reading user", puz.user);
        this.grid.setContents(puz.user.contents);
        this.grid.setNumbers(puz.user.numbers);
        if (puz.user.blacks) this.grid.setBlacks(puz.user.blacks);
      }
    }
    this.setState({ puz });
  }

  calculateCurrentClue() {
    const grid = this.grid,
      puz = this.state.puz;
    this.currentClue = {};
    if (this.grid && this.grid.word) {
      const number = this.grid.cell(...this.grid.word[0]).number,
        dir = this.directionIs(ACROSS) ? "A" : "D";
      const clue = _.find(
        puz.clues,
        clue =>
          clue.number + "" === number + "" && this.directionIs(clue.direction)
      );
      this.currentClue = clue ? { number: number + dir, text: clue.clue } : {};
    }
  }

  currentClueText() {}

  render() {
    const styles = {
      border: "1px solid black",
      width: 600,
      color: "black",
      padding: 20
    };
    const grid = this.grid,
      puz = this.state.puz;
    this.calculateCurrentClue();
    return grid && puz && puz.clues ? (
      <div>
        <PuzzleHeader puzzle={puz} />
        <div className="layout-puzzle">
          <div className="layout-cluebar-and-board">
            <ClueBar clue={this.currentClue} />
            <PuzzleGrid grid={this.grid} />
          </div>
          <div className="layout-clue-lists">
            <ClueList
              label="across"
              clues={this.state.puz.clues.filter(clue => clue.direction[1])}
              current={this.grid.clueNumber(ACROSS)}
              active={this.directionIs(ACROSS)}
            />
            <ClueList
              label="down"
              clues={this.state.puz.clues.filter(clue => clue.direction[0])}
              current={this.grid.clueNumber(DOWN)}
              active={this.directionIs(DOWN)}
            />
          </div>
        </div>
      </div>
    ) : (
      <div id="react-file-drop-demo" style={{ styles }}>
        <FileDrop onDrop={this.handleDrop}>Drop some files here!</FileDrop>
      </div>
    );
  }
}

observer(Puzzle);

export default Puzzle;
