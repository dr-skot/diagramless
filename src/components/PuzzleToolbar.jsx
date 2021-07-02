import React from 'react';
import DropMenu from './dropMenu';
import PuzzleClock from './PuzzleClock';

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
    console.log('setting symmetry', symmetryType);
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
  const checkmarks = {
    symmetry: puzzle.grid.symmetry,
    number: puzzle.grid.autonumbering ? 'continuously' : null,
  };

  // TODO support clear incomplete
  // TODO support autocheck
  // TODO move this menu outside component and pass as prop
  const menu = {
    number: ['now', 'continuously'],
    symmetry: ['diagonal', 'left/right'],
    clear: ['word', 'white squares', 'puzzle', 'puzzle & timer'],
    reveal: ['square', 'word', 'puzzle', 'diagram', 'circles'],
    check: ['square', 'word', 'puzzle'],
  };

  function onMenuSelect(title, item) {
    console.log('handle menu select');
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
            <DropMenu
              key={title}
              title={title}
              items={items}
              onSelect={onMenuSelect}
              checkmarks={[checkmarks[title]]}
            />
          ))}
        </div>
      </ul>
    </div>
  );
}
