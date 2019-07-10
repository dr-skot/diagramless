import React, { Component } from "react";
import PuzzleModel from "../model/puzzleModel";
import PuzzleHeader from "./puzzleHeader";
import PuzzleGrid from "./puzzleGrid";
import ClueBar from "./clueBar";
import ClueLists from "./clueLists";
import PuzzleFileDrop from "./puzzleFileDrop";
import PuzzleModal from "./puzzleModal";
import PuzzleToolbar from "./puzzleToolbar";
import { observer } from "mobx-react";
import { ACROSS, DOWN } from "../services/xwdService";

class Puzzle extends Component {
  state = {
    puz: null
  };

  clock = {
    time: 0,
    isRunning: true
  };

  handleFileDrop = fileContents => {
    this.puzzle = PuzzleModel.fromFileData(fileContents);
    this.setState({ puz: this.puzzle.data });
  };

  handleContentChange = () => {
    const { isFilled: wasFilled, isSolved: wasSolved } = this.state;
    const { isFilled, isSolved } = this.puzzle;
    const showModal = (!wasFilled && isFilled) || (!wasSolved && isSolved);
    if (isSolved)
      // TODO move to puzzleModel
      this.puzzle.grid.forEachCell(cell => {
        cell.exposeNumber();
      });
    this.setState({ showModal, isFilled, isSolved });
  };

  handleModalClose = () => {
    this.setState({ showModal: false });
  };

  handleMenuSelect = (title, item) => {
    if (title === "check") {
      if (item === "square") this.checkSquare();
      if (item === "puzzle") this.checkPuzzle();
    }
    if (title === "reveal") {
      if (item === "square") this.revealSquare();
      if (item === "puzzle") this.revealPuzzle();
    }
  };

  handleClueSelect = (number, directionString) => {
    // TODO get rid of magic string
    const direction =
      directionString.toLowerCase() === "across" ? ACROSS : DOWN;
    this.puzzle.grid.goToWord(number, direction);
  };

  checkSquare = () => {
    this.puzzle.grid.currentCell.check();
  };

  revealSquare = () => {
    this.puzzle.grid.currentCell.reveal();
  };

  checkPuzzle = () => {
    this.puzzle.grid.forEachCell(cell => {
      cell.check();
    });
  };

  revealPuzzle = () => {
    this.puzzle.grid.forEachCell(cell => {
      cell.reveal();
    });
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
      <React.Fragment>
        <div>
          <PuzzleHeader title={puz.title} author={puz.author} />
          <PuzzleToolbar
            clock={this.clock}
            onMenuSelect={this.handleMenuSelect}
          />
          <div className="layout-puzzle">
            <div className="layout-cluebar-and-board">
              <ClueBar clue={puzzle.currentClue} />
              <PuzzleGrid
                grid={grid}
                solved={this.state.isSolved}
                onContentChange={this.handleContentChange}
                relatedCells={puzzle.relatedCells}
              />
            </div>
            <ClueLists puzzle={puzzle} onClueSelect={this.handleClueSelect} />
          </div>
        </div>
        <PuzzleModal
          solved={this.state.isSolved}
          show={this.state.showModal}
          onClose={this.handleModalClose}
        />
      </React.Fragment>
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
