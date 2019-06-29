import React, { Component } from "react";
import { ACROSS, DOWN, puzzleFromFileData } from "../services/xwdService";
import PuzzleModel from "../model/puzzleModel";
import PuzzleHeader from "./puzzleHeader";
import PuzzleGrid from "./puzzleGrid";
import ClueBar from "./clueBar";
import ClueList from "./clueList";
import PuzzleFileDrop from "./puzzleFileDrop";
import { observer } from "mobx-react";

class Puzzle extends Component {
  state = {
    puz: null
  };

  grid = null;

  handleFileDrop = result => {
    console.log("fileDrop result", result);
    // TODO check for integrity of contents & fail gracefully
    const data = puzzleFromFileData(result);
    const puzzle = new PuzzleModel(data);
    this.puzzle = puzzle;
    this.grid = puzzle.grid;
    //this.grid.setContents(puz.solution);
    //this.grid.setNumbers(puz.numbers);
    this.setState({ puz: puzzle.data });
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
    return puzzle && puz.clues ? (
      <div>
        <PuzzleHeader puzzle={puz} />
        <div className="layout-puzzle">
          <div className="layout-cluebar-and-board">
            <ClueBar clue={puzzle.currentClue} />
            <PuzzleGrid grid={grid} />
          </div>
          <div className="layout-clue-lists">
            <ClueList
              label="across"
              clues={puz.clues.filter(clue => clue.direction[1])}
              current={grid.clueNumber(ACROSS)}
              active={puzzle.directionIs(ACROSS)}
            />
            <ClueList
              label="down"
              clues={puz.clues.filter(clue => clue.direction[0])}
              current={grid.clueNumber(DOWN)}
              active={puzzle.directionIs(DOWN)}
            />
          </div>
        </div>
        <PuzzleFileDrop onFileLoad={this.handleFileDrop} />
      </div>
    ) : (
      <PuzzleFileDrop onFileLoad={this.handleFileDrop} />
    );
  }
}

observer(Puzzle);

export default Puzzle;
