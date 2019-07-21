import React, { Component } from "react";
import XwdPuzzle from "../model/xwdPuzzle";
import PuzzleHeader from "./puzzleHeader";
import ClueBarAndBoard from "./clueBarAndBoard";
import ClueLists from "./clueLists";
import PuzzleModal, { SOLVED, FILLED, PAUSED } from "./puzzleModal";
import PuzzleToolbar from "./puzzleToolbar";
import PuzzleActionTracker, {
  CHANGE_CURSOR,
  CHANGE_DIRECTION,
  CHANGE_NUMBER,
  CHANGE_BLACK
} from "../services/puzzleActionTracker";
import { observer } from "mobx-react";
import { ACROSS, DOWN, LEFT, RIGHT, UP } from "../services/xwdService";
import { DIAGONAL, LEFT_RIGHT } from "../model/xwdGrid";
import { nextOrLast, wrapFindIndex } from "../services/common/utils";
import { decorate, action } from "mobx";
import _ from "lodash";

// TODO: allow only 4 state-changing methods
// changeCellContent(newValue)
// changeCellNumber(newValue)
// changeCellIsBlack(newValue)
// changeCursor(newValue)
// and record on action stack undoable groups of these, with before and after values
class Puzzle extends Component {
  state = {
    checkmarks: {}
  };
  clock = {
    time: 0,
    isRunning: true
  };
  blurInterval = 6000;
  wasFilled = false;
  wasSolved = false;

  componentDidMount() {
    this.setPuzzleFromLocalStorage();
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("focus", this.handleFocus);
    window.addEventListener("beforeunload", this.saveState);
    document.addEventListener("mousedown", this.disableDoubleClick);
  }

  componentWillUnmount() {
    this.saveState();
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("beforeunload", this.saveState);
    window.removeEventListener("focus", this.handleFocus);
    document.removeEventListener("mousedown", this.disableDoubleClick);
  }

  setPuzzleFromLocalStorage() {
    const puzzleData = JSON.parse(localStorage.getItem("xword"));
    this.clock = puzzleData.clock || this.clock;
    this.setPuzzle(XwdPuzzle.deserialize(puzzleData));
  }

  // TODO is clock part of file data?
  setPuzzleFromDroppedFile = fileContents => {
    const puzzle = XwdPuzzle.fromFileData(fileContents);
    this.clock.reset();
    this.setPuzzle(puzzle);
  };

  setPuzzle(puzzle) {
    this.puzzle = puzzle;
    this.actionTracker = new PuzzleActionTracker(puzzle);
    Object.assign(this, {
      wasFilled: puzzle.isFilled,
      wasSolved: puzzle.isSolved
    });
    this.clock.isRunning = !puzzle.isSolved;
    this.setState({ puzzle });
  }

  disableDoubleClick = event => {
    // TODO check that mouse is on the puzzle grid somewhere
    if (event.detail > 1) event.preventDefault();
  };

  saveState = () => {
    if (this.puzzle) {
      const serialized = { ...this.puzzle.serialize(), clock: this.clock };
      localStorage.setItem("xword", JSON.stringify(serialized));
    }
  };

  handleArrowKeys = event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return false;
    const direction = { 37: LEFT, 38: UP, 39: RIGHT, 40: DOWN }[event.keyCode];
    if (direction) {
      return this.hanleArrow(direction);
    } else {
      return true;
    }
  };

  handleKeyDown = event => {
    const keyCode = event.keyCode;
    //console.log("keyCode", keyCode);

    if (this.state.showModal) return;

    // TODO normalize handling of helper keys
    if (event.altKey && keyCode === 9) {
      this.handleTab({ eitherDirection: true, backward: event.shiftKey });
      event.preventDefault();
      return;
    }

    // handleArrowKeys() || handleTabKey() || handleDigit() || handleContent() || handleBackspace() || handleRebusKey()
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const shiftKeys = {
      9: () => this.handleTab({ backward: true })
    };

    const keys = {
      37: () => this.handleArrow(LEFT), // arrow left
      38: () => this.handleArrow(UP), // arrow up
      39: () => this.handleArrow(RIGHT), // arrow right
      40: () => this.handleArrow(DOWN), // arrow down
      190: () => {
        this.toggleBlack();
        this.advanceCursor();
      }, // . (period)
      32: () => this.handleAlpha(""), // space
      8: () => this.handleBackspace(), //
      9: () => this.handleTab()
    };

    const solved = this.puzzle.isSolved;
    let shouldPreventDefault = true;

    // TODO: organize this better
    // TODO: also disallow this if cell is verified
    if (solved) {
      keys[32] = null;
      keys[8] = null;
      keys[190] = null;
    }

    const keyAction = (event.shiftKey ? shiftKeys : keys)[event.keyCode];
    if (keyAction) {
      keyAction();
    } else if (!solved && _.inRange(keyCode, 48, 57 + 1)) {
      // digits
      this.handleDigit(String.fromCharCode(keyCode));
    } else if (!solved && _.inRange(keyCode, 58, 90 + 1)) {
      // alpha
      this.handleAlpha(String.fromCharCode(keyCode));
    } else {
      shouldPreventDefault = false;
    }

    if (shouldPreventDefault) {
      event.preventDefault();
    }
  };

  advanceCursor() {
    this.moveCursor(...this.puzzle.grid.direction);
  }

  moveCursor(i, j) {
    this.actionTracker.setCursor(...this.puzzle.grid.addToCursor(i, j));
  }

  isPerpendicular(direction) {
    const [i, j] = direction;
    const [down, across] = this.puzzle.grid.direction;
    return (across && i) || (down && j); // && !(i && j)
  }

  handleTab(options = {}) {
    this.actionTracker.recordAction(CHANGE_CURSOR, () =>
      this.puzzle.grid.goToNextWord(options)
    );
  }

  handleArrow(direction) {
    const [i, j] = direction;
    if (this.isPerpendicular(direction)) {
      this.toggleDirection();
    } else {
      this.moveCursor(i, j); // to record action
    }
  }

  isEditingNumber() {
    console.log("lastActionName", this.actionTracker.lastAction.name);
    return this.actionTracker.lastAction.name === CHANGE_NUMBER;
  }

  handleDigit(digit) {
    this.actionTracker.recordAction(CHANGE_NUMBER, () => {
      const cell = this.puzzle.grid.currentCell;
      cell.isBlack = false; // come out of black if edit number
      cell.number = (this.isEditingNumber() ? cell.number : "") + digit;
      if (cell.number === "0") cell.number = ""; // delete if 0
    });
  }

  handleAlpha(a) {
    const grid = this.puzzle.grid;
    const cellIsEmpty = pos => !grid.cell(...pos).content;

    const cell = grid.currentCell;
    if (cell.isVerified || cell.wasRevealed) return; // TODO advance cursor?

    if (grid.currentCell.isBlack) this.toggleBlack();

    const cellWasEmpty = cellIsEmpty(grid.cursor);

    this.actionTracker.setContent(a);

    // advanceCursor(cursorPolicy[cellWasEmpty ? TYPE_IN_EMPTY_CELL : TYPE_IN_FULL_CELL]);

    // move to next cell in word
    const word = grid.word;
    if (!word) return; // TODO is this a copout?
    const currentIndex = word.findIndex(pos => _.isEqual(pos, grid.cursor));
    let nextCellIdx = nextOrLast(word, currentIndex);

    // if we just filled an empty cell, skip to the next empty cell, with wrap around
    if (cellWasEmpty) {
      const nextEmptyCellIdx = wrapFindIndex(word, nextCellIdx, cellIsEmpty);
      if (nextEmptyCellIdx > -1) nextCellIdx = nextEmptyCellIdx;
    }

    const newCursor = word[nextCellIdx];
    this.actionTracker.setCursor(...newCursor);

    this.handleContentChange();
  }

  handleBackspace() {
    const grid = this.puzzle.grid;
    if (this.actionTracker.lastAction.name === CHANGE_NUMBER) {
      const cell = grid.currentCell;
      if (cell.number && cell.number.length) {
        this.actionTracker.recordAction(CHANGE_NUMBER, () => {
          cell.number = cell.number.slice(0, -1); // all but last letter
        });
      }
    } else {
      if (!grid.currentCell.content) {
        const [i, j] = grid.direction;
        this.moveCursor(-i, -j);
      }
      // TODO: disallow this on model
      if (
        !this.puzzle.isSolved &&
        !grid.currentCell.isVerified &&
        !grid.currentCell.wasRevealed
      ) {
        this.actionTracker.setContent("");
      }
    }
  }

  toggleBlack() {
    const cell = this.puzzle.grid.currentCell;
    if (cell.isVerified) return;
    this.actionTracker.recordAction(CHANGE_BLACK, () => {
      cell.isBlack = !cell.isBlack;
      cell.isMarkedWrong = false; // TODO handle this elsewhere
    });
  }

  toggleDirection() {
    this.actionTracker.recordAction(CHANGE_DIRECTION, () => {
      this.puzzle.grid.toggleDirection();
    });
  }

  handleCellClick = (row, col, event) => {
    if (this.puzzle.grid.cursorIsAt(row, col)) {
      this.toggleDirection();
    } else {
      this.actionTracker.setCursor(row, col);
    }
    event.preventDefault();
  };

  handleContentChange = () => {
    const { wasFilled, wasSolved } = this;
    const { isFilled, isSolved } = this.puzzle;
    const showModal =
      (!wasSolved && isSolved && SOLVED) || (!wasFilled && isFilled && FILLED);
    if (isSolved) {
      this.puzzle.grid.forEachCell(cell => {
        cell.exposeNumber();
        cell.circle = cell.solution.circle;
      });
      this.clock.stop();
    }
    Object.assign(this, { wasFilled: isFilled, wasSolved: isSolved });
    this.setState({ showModal });
  };

  handleModalClose = reason => {
    this.setState({ showModal: false });
    if (reason === PAUSED) this.clock.start();
  };

  handleClockPause = () => {
    this.setState({ showModal: PAUSED });
  };

  // TODO all these state changes should register their actions (ugh)
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
          // basically, everything except content
          cell.isBlack = cell.solution.isBlack;
          cell.number = cell.solution.number;
          cell.circle = cell.solution.circle;
        });
      } else {
        cells.forEach(cell => cell.reveal());
      }
    }
    if (title === "clear") {
      cells.forEach(cell => {
        cell.setContent("");
        cell.isBlack = false;
        cell.circle = false;
        cell.wasRevealed = false;
        cell.isVerified = false;
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

  handleBlur = () => {
    this.blurTimeout = setTimeout(this.clock.stop, this.blurInterval);
  };

  handleFocus = () => {
    if (this.blurTimeout) clearTimeout(this.blurTimeout);
  };

  handleDrop = event => {
    console.log("handleDrop");
    event.preventDefault();
    const transfer = event.dataTransfer,
      file = transfer.items
        ? transfer.items[0] && transfer.items[0].kind === "file"
          ? transfer.items[0].getAsFile()
          : null
        : transfer.files[0];

    if (!file) {
      console.log("No file found");
    } else {
      const reader = new FileReader();
      reader.onabort = () => console.log("File reading was aborted");
      reader.onerror = () => console.log("File reading has failed");
      reader.onload = () => {
        this.setPuzzleFromDroppedFile(reader.result);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  render() {
    const puzzle = this.puzzle,
      grid = puzzle ? puzzle.grid : null,
      puzzleData = puzzle ? puzzle.data : null;

    if (puzzle) puzzle.calculateCurrentClue();

    const puzzleHtml = puzzle ? (
      <React.Fragment>
        <div
          className={
            this.state.showModal === PAUSED ? "app-obscured--26XpG " : ""
          }
        >
          <PuzzleHeader title={puzzleData.title} author={puzzleData.author} />
          <PuzzleToolbar
            clock={this.clock}
            onClockPause={this.handleClockPause}
            onMenuSelect={this.handleMenuSelect}
            checkmarks={this.state.checkmarks}
          />
          <div
            className="layout-puzzle"
            onDrop={this.handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <ClueBarAndBoard
              clue={puzzle.currentClue}
              grid={grid}
              onCellClick={this.handleCellClick}
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
      <div
        className="no-puzzle"
        onDrop={this.handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        Drop a puzzle file here!
      </div>
    );

    return <div>{puzzleHtml}</div>;
  }
}

decorate(Puzzle, {
  handleClueSelect: action,
  handleMenuSelect: action,
  handleContentChange: action,
  handleKeyDown: action,
  handleCellClick: action
});
observer(Puzzle);

export default Puzzle;
