import React from 'react';
import DropMenu from './DropMenu';
import PuzzleClock from './PuzzleClock';
import {
  autonumber,
  changeCellsInWord,
  changeCurrentCell,
  setSymmetry,
  toggleAutonumbering,
} from '../model/puzzle';
import { puzdata_to_pdf } from '../services/puzzlePdf';
import { gridIsSolved, mapCells, revealCircles, revealDiagram } from '../model/grid';
import { checkCell, clearCell, revealCell } from '../model/cell';

// TODO all these state changes should register their actions (ugh)
const handleMenuSelect = (title, item, puzzle, clock) => {
  const grid = puzzle.grid,
    cellFinder = {
      square: () => [grid.currentCell],
      word: () => grid.word.map((location) => grid.cell(...location)),
      puzzle: () => grid.grid.flat(),
      'puzzle & timer': () => grid.grid.flat(),
      'white squares': () => grid.grid.flat().filter((cell) => !cell.isBlack),
      // TODO support incomplete
    }[item],
    cells = cellFinder ? cellFinder() : [];
  if (title === 'print') {
    // this.print();
  }
  if (title === 'rebus') {
    // this.handleRebusButton();
  }
  if (title === 'check') {
    cells.forEach((cell) => cell.check());
  }
  if (title === 'reveal') {
    if (item === 'diagram') {
      grid.revealDiagram();
    } else if (item === 'circles') {
      grid.revealCircles();
    } else {
      cells.forEach((cell) => cell.reveal());
    }
  }
  if (title === 'clear') {
    if (cells.length < 1) return;
    cells.forEach((cell) => {
      cell.clear({ numbers: item.match(/^puzzle/) });
    });
    if (item === 'puzzle & timer') {
      this.clock.reset();
    }
    this.clock.start();
  }
  if (title === 'symmetry') {
    const symmetryType = item;
    grid.setSymmetry(symmetryType);
  }
  if (title === 'number') {
    if (item === 'continuously') {
      grid.toggleAutonumbering();
    } else {
      grid.numberWordStarts();
    }
  }
};

export default function PuzzleToolbar({ clock, puzzle, setPuzzle }) {
  const checked = {
    symmetry: puzzle.symmetry,
    number: puzzle.isAutonumbered ? 'continuously' : null,
  };

  // TODO support clear incomplete
  // TODO support autocheck
  // TODO write convenience functions changePuzzleCells
  const menu = {
    number: {
      now: () => setPuzzle(autonumber),
      continuously: () => setPuzzle(toggleAutonumbering),
    },
    symmetry: {
      diagonal: () => setPuzzle(setSymmetry('diagonal')),
      'left-right': () => setPuzzle(setSymmetry('left-right')),
    },
    clear: {
      word: () => setPuzzle(changeCellsInWord(clearCell)),
      'white squares': () =>
        setPuzzle((prev) => ({
          ...prev,
          grid: mapCells((c) => (c.isBlack ? c : clearCell(c)))(prev.grid),
        })),
      puzzle: () =>
        setPuzzle((prev) => ({ ...prev, grid: mapCells((cell) => clearCell(cell))(prev.grid) })),
      'puzzle & timer': () => {
        setPuzzle((prev) => ({ ...prev, grid: mapCells((cell) => clearCell(cell))(prev.grid) }));
        clock.reset();
      },
    },
    reveal: {
      square: () => setPuzzle(changeCurrentCell(revealCell)),
      word: () => setPuzzle(changeCellsInWord(revealCell)),
      puzzle: () => setPuzzle((prev) => ({ ...prev, grid: mapCells(revealCell)(prev.grid) })),
      diagram: () => setPuzzle((prev) => ({ ...prev, grid: revealDiagram(prev.grid) })),
      circles: () => setPuzzle((prev) => ({ ...prev, grid: revealCircles(prev.grid) })),
    },
    check: {
      square: () => setPuzzle(changeCurrentCell(checkCell)),
      word: () => setPuzzle(changeCellsInWord(checkCell)),
      puzzle: () => setPuzzle((prev) => ({ ...prev, grid: mapCells(checkCell)(prev.grid) })),
    },
  };

  function onMenuSelect(title, item) {
    handleMenuSelect(title, item, puzzle, clock);
    // onChange(puzzle);
  }

  function print() {
    puzdata_to_pdf(puzzle);
  }

  return (
    <div className="Toolbar-wrapper--1S7nZ toolbar-wrapper">
      <ul className="Toolbar-tools--2qUqg">
        <li className="Tool-button--39W4J Tool-tool--Fiz94">
          <button onClick={print}>Print</button>
        </li>
        <PuzzleClock clock={clock} disabled={gridIsSolved(puzzle.grid)} />
        <li className="Tool-button--39W4J Tool-tool--Fiz94 Tool-texty--2w4Br">
          <button onClick={() => onMenuSelect('rebus', '')}>rebus</button>
        </li>
        <div className="Toolbar-expandedMenu--2s4M4">
          {Object.entries(menu).map(([title, items]) => (
            <DropMenu key={title} title={title} items={items} checked={[checked[title]]} />
          ))}
        </div>
      </ul>
    </div>
  );
}
