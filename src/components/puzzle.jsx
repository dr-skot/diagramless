import React, { Component } from "react";
import PuzzleModel from "../model/puzzleModel";
import PuzzleHeader from "./puzzleHeader";
import ClueBarAndBoard from "./clueBarAndBoard";
import ClueLists from "./clueLists";
import PuzzleFileDrop from "./puzzleFileDrop";
import PuzzleModal, { SOLVED, FILLED, PAUSED } from "./puzzleModal";
import PuzzleToolbar from "./puzzleToolbar";
import { observer } from "mobx-react";
import { ACROSS, DOWN } from "../services/xwdService";
import { DIAGONAL, LEFT_RIGHT } from "../model/xwdGrid";

class Puzzle extends Component {
  state = {
    puz: null,
    checkmarks: {}
  };

  clock = {
    time: 0,
    isRunning: true
  };

  handleFileDrop = fileContents => {
    this.puzzle = PuzzleModel.fromFileData(fileContents);
    console.log("resetting clock");
    this.clock.reset();
    this.setState({ puz: this.puzzle.data });
  };

  handleContentChange = () => {
    const { isFilled: wasFilled, isSolved: wasSolved } = this.state;
    const { isFilled, isSolved } = this.puzzle;
    const showModal =
      (!wasSolved && isSolved && SOLVED) || (!wasFilled && isFilled && FILLED);
    if (isSolved)
      // TODO move to puzzleModel
      this.puzzle.grid.forEachCell(cell => {
        cell.exposeNumber();
      });
    this.setState({ showModal, isFilled, isSolved });
  };

  handleModalClose = reason => {
    this.setState({ showModal: false });
    if (reason === PAUSED) this.clock.start();
  };

  handleClockPause = () => {
    this.setState({ showModal: PAUSED });
  };

  /*
  getCells = (which) => {
    const grid = this.puzzle.grid,
      cellFinder = {
        SQUARE: () => [grid.currentCell],
        WORD: () => grid.word.map(location => grid.cell(...location)),
        PUZZLE: () => grid.grid.flat(),
        WHITE_SQUARES: () => grid.grid.flat().filter(cell => !cell.isBlack)
        // TODO support incomplete
      }[which],
    return cellFinder();
   };
   */

  handleMenuSelect = (title, item) => {
    const grid = this.puzzle.grid,
      cellFinder = {
        square: () => [grid.currentCell],
        word: () => grid.word.map(location => grid.cell(...location)),
        puzzle: () => grid.grid.flat(),
        "puzzle & timer": () => grid.grid.flat(),
        "white squares": () => grid.grid.flat().filter(cell => !cell.isBlack)
        // TODO support incomplete
      }[item],
      cells = cellFinder ? cellFinder() : [];
    if (title === "check") {
      cells.forEach(cell => cell.check());
    }
    if (title === "reveal") {
      if (item === "diagram") {
        grid.forEachCell(cell => {
          cell.isBlack = cell.solution.isBlack;
          cell.number = cell.solution.number;
        });
      } else {
        cells.forEach(cell => cell.reveal());
      }
    }
    if (title === "clear") {
      cells.forEach(cell => {
        cell.setContent("");
        cell.isBlack = false;
        if (item.match(/^puzzle/)) cell.number = "";
      });
      if (item === "puzzle & timer") {
        this.clock.reset();
      }
    }
    if (title === "symmetry") {
      const symmetryType = {
        diagonal: DIAGONAL,
        "left/right": LEFT_RIGHT
      }[item];
      if (symmetryType) {
        grid.setSymmetry(symmetryType);
        this.setCheckmark(
          "symmetry",
          grid.symmetry === symmetryType ? item : null
        );
      }
    }
    if (title === "number") {
      if (item === "continuously") {
        grid.toggleAutonumbering();
        this.setCheckmark("number", grid.autonumbering ? item : null);
      } else {
        grid.numberWordStarts();
      }
    }
  };

  setCheckmark(menu, item) {
    const checkmarks = { ...this.state.checkmarks };
    checkmarks[menu] = item;
    this.setState({ checkmarks });
  }

  handleClueSelect = (number, directionString) => {
    // TODO get rid of magic string
    const direction =
      directionString.toLowerCase() === "across" ? ACROSS : DOWN;
    this.puzzle.grid.goToWord(number, direction);
  };

  componentDidUpdate() {
    if (this.puzzle) {
      localStorage.setItem("xword", JSON.stringify(this.puzzle.serialize()));
    }
  }

  componentDidMount() {
    const puzzleData = JSON.parse(localStorage.getItem("xword"));
    this.puzzle = PuzzleModel.deserialize(puzzleData);
    const { isFilled, isSolved } = this.puzzle;
    this.setState({
      puz: this.puzzle.data,
      puzzle: this.puzzle,
      isFilled,
      isSolved
    });
    window.addEventListener("blur", () => this.clock.stop());
  }

  render() {
    const puzzle = this.puzzle,
      grid = puzzle ? puzzle.grid : null,
      puz = puzzle ? puzzle.data : null;

    if (puzzle) puzzle.calculateCurrentClue();

    const puzzleHtml = puzzle ? (
      <React.Fragment>
        <div
          className={
            this.state.showModal === PAUSED ? "app-obscured--26XpG " : ""
          }
        >
          <PuzzleHeader title={puz.title} author={puz.author} />
          <PuzzleToolbar
            clock={this.clock}
            onClockPause={this.handleClockPause}
            onMenuSelect={this.handleMenuSelect}
            checkmarks={this.state.checkmarks}
          />
          <div className="layout-puzzle">
            <ClueBarAndBoard
              clue={puzzle.currentClue}
              grid={grid}
              symmetry={this.symmetry}
              solved={this.state.isSolved}
              onContentChange={this.handleContentChange}
              relatedCells={puzzle.relatedCells}
            />
            <ClueLists puzzle={puzzle} onClueSelect={this.handleClueSelect} />
          </div>
        </div>
        <PuzzleModal
          reason={this.state.showModal}
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
