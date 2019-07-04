import React, { Component } from "react";
import PuzzleModel from "../model/puzzleModel";
import PuzzleHeader from "./puzzleHeader";
import PuzzleGrid from "./puzzleGrid";
import ClueBar from "./clueBar";
import ClueLists from "./clueLists";
import PuzzleFileDrop from "./puzzleFileDrop";
import { observer } from "mobx-react";

class Puzzle extends Component {
  state = {
    puz: null
  };

  handleFileDrop = fileContents => {
    this.puzzle = PuzzleModel.fromFileData(fileContents);
    this.setState({ puz: this.puzzle.data });
  };

  componentDidUpdate() {
    if (this.puzzle) {
      localStorage.setItem("xword", JSON.stringify(this.puzzle.serialize()));
    }
  }

  componentDidMount() {
    const puzzleData = JSON.parse(localStorage.getItem("xword"));
    this.puzzle = PuzzleModel.deserialize(puzzleData);
    this.setState({ puz: this.puzzle.data, puzzle: this.puzzle });
  }

  render() {
    const puzzle = this.puzzle,
      grid = puzzle ? puzzle.grid : null,
      puz = puzzle ? puzzle.data : null;

    if (puzzle) puzzle.calculateCurrentClue();

    const puzzleHtml = puzzle ? (
      <div>
        <p>Solved? {puzzle.isSolved() ? "yes" : "no"}</p>
        <PuzzleHeader puzzle={puz} />
        <div className="layout-puzzle">
          <div className="layout-cluebar-and-board">
            <ClueBar clue={puzzle.currentClue} />
            <PuzzleGrid grid={grid} />
          </div>
          <ClueLists puzzle={puzzle} />
        </div>
      </div>
    ) : (
      ""
    );

    return (
      <div>
        {puzzleHtml}
        <PuzzleFileDrop onFileLoad={this.handleFileDrop} />
      </div>
    );
  }
}

observer(Puzzle);

export default Puzzle;
