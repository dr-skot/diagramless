import React from 'react';
import DropMenu from './DropMenu';
import PuzzleClock from './PuzzleClock';
import { autonumber, setSymmetry, toggleAutonumbering } from '../model/puzzle';

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
      word: () => {},
      'white squares': () => {},
      puzzle: () => {},
      'puzzle & timer': () => {},
    },
    reveal: {
      square: () => {},
      word: () => {},
      puzzle: () => {},
      diagram: () => {},
      circles: () => {},
    },
    check: {
      square: () => {},
      word: () => {},
      puzzle: () => {},
    },
  };

  function onMenuSelect(title, item) {
    handleMenuSelect(title, item, puzzle, clock);
    // onChange(puzzle);
  }

  return (
    <div className="Toolbar-wrapper--1S7nZ toolbar-wrapper">
      <ul className="Toolbar-tools--2qUqg">
        <li className="Tool-button--39W4J Tool-tool--Fiz94">
          <button onClick={() => onMenuSelect('print')}>Print</button>
        </li>
        <PuzzleClock clock={clock} disabled={puzzle.isSolved} />
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
