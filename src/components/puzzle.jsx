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
import {
  nextOrLast,
  wrapFindIndex,
  fitTo,
  keyMatch,
  altKey,
} from "../services/common/utils";
import { decorate, action } from "mobx";
import _ from "lodash";
import Clock from "../model/clock";
import { DEFAULT_PUZZLE_DATA } from "../model/defaultPuzzle";
import {puzdata_to_pdf} from "../services/puzzlePdf";

class Puzzle extends Component {
  state = {
    checkmarks: {}
  };
  clock = new Clock();
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
    this.clock.on('stop', this.handleClockPause);
  }

  componentWillUnmount() {
    this.saveState();
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("beforeunload", this.saveState);
    window.removeEventListener("focus", this.handleFocus);
    document.removeEventListener("mousedown", this.disableDoubleClick);
    this.clock.off('stop', this.handleClockPause);
  }

  componentDidUpdate() {
    this.rebusInput[this.rebus ? "focus" : "blur"]();
  }

  setPuzzleFromLocalStorage() {
    try {
      this.setPuzzleFromData(JSON.parse(localStorage.getItem('xword')) || DEFAULT_PUZZLE_DATA);
    } catch (e) {
      console.error('Error parsing local storage data for key "xword"');
      this.setPuzzleFromData(DEFAULT_PUZZLE_DATA);
    }
  }

  setPuzzleFromData(puzzleData) {
    const checkmarks = puzzleData.checkmarks || this.state.checkmarks;
    this.clock.setTime(puzzleData.clock || 0);
    this.setPuzzle(XwdPuzzle.deserialize(puzzleData));
    Object.keys(checkmarks).forEach((menu) => {
      this.handleMenuSelect(menu, checkmarks[menu])
    });
    this.setState({checkmarks});
  }

  // TODO is clock part of file data?
  setPuzzleFromDroppedFile = fileContents => {
    const puzzle = XwdPuzzle.fromFileData(fileContents);
    const checkmarks = this.state.checkmarks;
    this.clock.reset();
    this.setPuzzle(puzzle);
    Object.keys(checkmarks).forEach((menu) => { this.handleMenuSelect(menu, checkmarks[menu]) });
  };

  setPuzzle(puzzle) {
    this.puzzle = puzzle;
    this.actionTracker = new PuzzleActionTracker(puzzle);
    Object.assign(this, {
      wasFilled: puzzle.isFilled,
      wasSolved: puzzle.isSolved
    });
    (puzzle.isSolved ? this.clock.stop : this.clock.start)();
    this.setState({ puzzle });
  }

  disableDoubleClick = event => {
    // TODO check that mouse is on the puzzle grid somewhere
    if (event.detail > 1) event.preventDefault();
  };

  saveState = () => {
    if (this.puzzle) {
      const serialized = { ...this.puzzle.serialize(), clock: this.clock.getTime(), checkmarks: this.state.checkmarks };
      localStorage.setItem("xword", JSON.stringify(serialized));
    }
  };

  handleArrowKey = event => {
    if (keyMatch(event, [37, 40])) {
      const direction = { 37: LEFT, 38: UP, 39: RIGHT, 40: DOWN }[
        event.keyCode
      ];
      if (direction) {
        this.handleArrow(direction);
        return true;
      }
    }
  };

  handleTabKey = event => {
    if (keyMatch(event, 9, [altKey])) {
      this.handleTab({
        eitherDirection: event.altKey,
        backward: event.shiftKey
      });
      return true;
    }
  };

  handlePeriodKey = event => {
    if (keyMatch(event, 190) && this.puzzle && !this.puzzle.isSolved) {
      this.toggleBlack();
      this.advanceCursor();
      return true;
    }
  };

  handleAlphaKey = event => {
    if (
      (keyMatch(event, [58, 90]) || keyMatch(event, 32)) &&
      this.puzzle && !this.puzzle.isSolved
    ) {
      this.handleAlpha(String.fromCharCode(event.keyCode));
      return true;
    }
  };

  handleDigitKey = event => {
    if (
      keyMatch(event, [48, 57]) &&
      !this.puzzle.grid.autonumbering &&
      this.puzzle && !this.puzzle.isSolved
    ) {
      this.handleDigit(String.fromCharCode(event.keyCode));
      return true;
    }
  };

  handleBackspaceKey = event => {
    if (keyMatch(event, 8) && this.puzzle && !this.puzzle.isSolved) {
      this.handleBackspace();
      return true;
    }
  };

  keyHandlers = [
    this.handleArrowKey,
    this.handleTabKey,
    this.handleBackspaceKey,
    this.handleAlphaKey,
    this.handleDigitKey,
    this.handlePeriodKey
  ];

  handleKeyDown = event => {
    if (event.metaKey) return;
    if (this.handleRebus(event)) return;
    if (this.state.showModal) return;

    this.keyHandlers.forEach(handler => {
      if (handler(event)) event.preventDefault();
    });
  };

  handleRebus = event => {
    const esc = 27,
      enter = 13,
      key = event.keyCode;

    if (this.wasSolved) return false;
    if (key !== esc && !this.rebus) return false; // not rebus
    if (key !== esc && key !== enter) return true; // still typing rebus

    // otherwise, start (esc), cancel (esc), or set rebus (enter)
    event.preventDefault();
    if (key === esc) {
      this.rebusInput.value = this.puzzle.grid.currentCell.content;
      // align rebus with current cell & show it
      fitTo(this.cursorTd, this.rebusDiv);
    } else {
      // key === enter
      this.actionTracker.setContent(
        this.rebusInput.value.replace(/\s/g, "").toUpperCase()
      );
      // use the keyup event to launch the modal, so that it doesn't close the modal
      window.addEventListener('keyup', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.handleContentChange();
      }, { once: true });
    }
    this.rebus = !this.rebus; this.setState({ rebus: this.rebus });

    return true;
  };

  // TODO consolidate with handleRebus above
  handleRebusButton = () => {
    if (this.wasSolved) return false;
    if (!this.rebus) {
      this.rebusInput.value = this.puzzle.grid.currentCell.content;
      // align rebus with current cell & show it
      fitTo(this.cursorTd, this.rebusDiv);
    } else {
      this.actionTracker.setContent(
        this.rebusInput.value.replace(/\s/g, "").toUpperCase()
      );
      this.handleContentChange();
    }
    this.rebus = !this.rebus; this.setState({ rebus: this.rebus });

    return true;
  };

  print() {
    const puzzleData = JSON.parse(localStorage.getItem("xword")) || DEFAULT_PUZZLE_DATA;
    puzdata_to_pdf(puzzleData);
  }

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
    options.skipFilled = true;
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

    this.actionTracker.setContent(a.trim());

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
    const grid = this.puzzle.grid,
      cell = grid.currentCell;
    if (this.isEditingNumber()) {
      if (cell.number && cell.number.length) {
        this.actionTracker.recordAction(CHANGE_NUMBER, () => {
          cell.number = cell.number.slice(0, -1); // all but last letter
        });
      }
    } else {
      if (!cell.content) {
        const [i, j] = grid.direction;
        this.moveCursor(-i, -j);
      }
      // TODO: protect verified and revealed cells on model, or tracker
      if (!cell.isVerified && !cell.wasRevealed) {
        this.actionTracker.setContent("");
      }
    }
  }

  toggleBlack() {
    const cell = this.puzzle.grid.currentCell;
    if (cell.isVerified) return;
    this.actionTracker.recordAction(CHANGE_BLACK, () => {
      cell.isBlack = !cell.isBlack;
      cell.isMarkedWrong = false; // TODO handle this on model
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
    if (title === "print") {
      this.print();
    }
    if (title === "rebus") {
      this.handleRebusButton();
    }
    if (title === "check") {
      cells.forEach(cell => cell.check());
    }
    if (title === "reveal") {
      if (item === "diagram") {
        grid.revealDiagram();
      } else if (item === "circles") {
        grid.revealCircles();
      } else {
        cells.forEach(cell => cell.reveal());
      }
    }
    if (title === "clear") {
      if (cells.length < 1) return;
      cells.forEach(cell => {
        cell.clear({ numbers: item.match(/^puzzle/) });
      });
      if (item === "puzzle & timer") {
        this.clock.reset();
      }
      this.clock.start();
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
    if (this.puzzle && !this.puzzle.isSolved) {
      this.blurTimeout = setTimeout(this.clock.stop, this.blurInterval);
    }
  };

  handleFocus = () => {
    if (this.blurTimeout) clearTimeout(this.blurTimeout);
  };

  handleDrop = event => {
    event.preventDefault();
    const transfer = event.dataTransfer,
      file = transfer.items
        ? transfer.items[0] && transfer.items[0].kind === "file"
          ? transfer.items[0].getAsFile()
          : null
        : transfer.files[0];

    if (!file) {
      console.error("No file found");
    } else {
      const reader = new FileReader();
      reader.onabort = () => console.error("File reading was aborted");
      reader.onerror = () => console.error("File reading has failed");
      reader.onload = () => {
        this.setPuzzleFromDroppedFile(reader.result);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  render() {
    console.log('render puzzle', this.state);
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
            puzzleIsSolved={puzzle.isSolved}
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
              cursorRef={el => (this.cursorTd = el)}
            />
            <ClueLists puzzle={puzzle} onClueSelect={this.handleClueSelect} />
          </div>
        </div>
        <div id="rebus" ref={el => (this.rebusDiv = el)}>
          <input
            ref={el => (this.rebusInput = el)}
            style={this.rebus ? {} : { display: "none" }}
          />
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
        <p>Drop a puzzle file here</p>
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
