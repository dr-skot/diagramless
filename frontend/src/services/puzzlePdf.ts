// adapted from https://crosswordnexus.com/js/puz_functions.js
// (c) 2016 Alex Boisvert
// licensed under MIT license
// https://opensource.org/licenses/MIT

import { jsPDF } from 'jspdf';
import { XwdClue, XwdPuzzle } from '../model/puzzle';
import { XwdCell } from '../model/cell';
const isAcrossClue = (clue: XwdClue) => clue.direction === 'across';
const isDownClue = (clue: XwdClue) => clue.direction === 'down';
const clueText = (clue: XwdClue) => `${clue.number}. ${clue.text}`;

const DEFAULT_TITLE_SIZE = 12;
const PTS_PER_IN = 72;
const DOC_WIDTH = 8.5 * PTS_PER_IN;
const DOC_HEIGHT = 11 * PTS_PER_IN;

function drawSquare(doc: any, cell: XwdCell, x: number, y: number, size: number, color = 0.6) {
  const numberOffset = size / 20;
  const numberSize = size / 3.5;
  const contentOffset = size * (4 / 5);
  const contentSize = size / (1.5 + 0.5 * (cell.content.length - 1));

  doc.setFillColor(color.toString());
  doc.setDrawColor(color.toString());

  doc.rect(x, y, size, size, cell.isBlack ? 'FD' : 'D');

  if (cell.isBlack) return;

  //numbers
  doc.setFontSize(numberSize);
  doc.text(cell.number.toString(), x + numberOffset, y + numberSize);

  // letters
  doc.setFontSize(contentSize);
  doc.text(cell.content, x + size / 2, y + contentOffset, { align: 'center' });

  // circles
  if (cell.circle) {
    doc.circle(x + size / 2, y + size / 2, size / 2);
  }
}

function drawGrid(doc: jsPDF, puzzle: XwdPuzzle, x0: number, y0: number, cellSize: number) {
  for (let i = 0; i < puzzle.height; i++) {
    for (let j = 0; j < puzzle.width; j++) {
      const y = y0 + i * cellSize;
      const x = x0 + j * cellSize;
      const cell = puzzle.grid[i][j];

      drawSquare(doc, cell, x, y, cellSize);
    }
  }
}

/** Create a PDF (requires jsPDF) **/

export function puzzleToPdf(puzzle: XwdPuzzle, _options: any = {}) {
  const DEFAULT_OPTIONS = {
    margin: 20,
    titleSize: null,
    authorSize: null,
    copyrightSize: 8,
    numColumns: null,
    numFullColumns: null,
    columnPadding: 10,
    gray: 0.55,
    underTitleSpacing: 20,
    maxClueSize: 14,
    minClueSize: 5,
    gridPadding: 5,
    outfile: 'crossword-puzzle.pdf',
  };

  const options = { ...DEFAULT_OPTIONS, ..._options };

  // If options.numColumns is null, we determine it ourselves
  if (!options.numColumns || !options.numFullColumns) {
    if (puzzle.height >= 17) {
      options.numColumns = 5;
      options.numFullColumns = 2;
    } else if (puzzle.width >= 17) {
      options.numColumns = 4;
      options.numFullColumns = 1;
    } else {
      options.numColumns = 3;
      options.numFullColumns = 1;
    }
  }

  // The maximum font size of title and author
  const maxTitleAuthorSize = Math.max(options.titleSize, options.authorSize);

  let margin = options.margin;

  let doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  // create the clue strings and clue arrays
  const acrossClues = ['ACROSS', ...puzzle.clues.filter(isAcrossClue).map(clueText), ''];
  const downClues = ['DOWN', ...puzzle.clues.filter(isDownClue).map(clueText)];

  // size of columns
  let colWidth =
    (DOC_WIDTH - 2 * margin - (options.numColumns - 1) * options.columnPadding) /
    options.numColumns;

  // The grid is under all but the first few columns
  let gridWidth =
    DOC_WIDTH - 2 * margin - options.numFullColumns * (colWidth + options.columnPadding);
  let gridHeight = (gridWidth / puzzle.width) * puzzle.height;
  // x and y position of grid
  let grid_x = DOC_WIDTH - margin - gridWidth;
  let grid_y = DOC_HEIGHT - margin - gridHeight - options.copyrightSize;

  // try font sizes until the fit is good, then write to the pdf
  let clueSize = options.maxClueSize;
  let sizingFont = true;
  let written = false;

  while (!written) {
    const cluePadding = clueSize / 3;
    doc.setFontSize(clueSize);

    // Print the clues
    let line_x = margin;
    let line_y = margin + maxTitleAuthorSize + options.underTitleSpacing + clueSize + cluePadding;
    let columnNumber = 0;
    // eslint-disable-next-line no-loop-func
    [acrossClues, downClues].forEach((clues) => {
      clues.forEach((clue, i) => {
        // check to see if we need to wrap
        const max_line_y =
          columnNumber < options.numFullColumns
            ? DOC_HEIGHT - margin - options.copyrightSize
            : grid_y - options.gridPadding;

        // Split our clue
        const lines: string[] = doc.splitTextToSize(clue, colWidth);

        if (line_y + (lines.length - 1) * (clueSize + cluePadding) > max_line_y) {
          // move to new column
          columnNumber += 1;
          line_x = margin + columnNumber * (colWidth + options.columnPadding);
          line_y =
            margin + maxTitleAuthorSize + options.underTitleSpacing + clueSize + cluePadding;
        }

        lines.forEach((line, j) => {
          if (!sizingFont) {
            // bold the ACROSS or DOWN title
            doc.setFont('helvetica', i + j === 0 ? 'bold' : 'normal');
            doc.text(line, line_x, line_y);
            written = true;
          }
          // set the y position for the next line
          line_y += clueSize + cluePadding;
        });
      });
    });

    // reduce font size until the columns fit
    if (clueSize >= options.minClueSize && columnNumber > options.numColumns - 1) {
      clueSize -= 0.1;
    } else {
      sizingFont = false;
    }
  }

  /* Determine title and author size */

  let sizingTitle = true;
  options.titleSize = DEFAULT_TITLE_SIZE;

  while (sizingTitle) {
    doc.setFontSize(options.titleSize);
    // @ts-ignore
    const titleWidth = doc.getTextWidth(puzzle.title);
    const authorWidth = doc.getTextWidth(puzzle.author);
    const totalWidth = titleWidth + authorWidth;
    const availableWidth = DOC_WIDTH - 2 * margin;

    if (totalWidth < availableWidth || options.titleSize <= 8) {
      sizingTitle = false;
    } else {
      options.titleSize -= 1;
    }
    options.authorSize = options.titleSize;
  }

  /* Render title and author */

  let title_x = margin;
  let author_x = DOC_WIDTH - margin;
  let titleAuthor_y = margin + maxTitleAuthorSize;
  //title
  doc.setFontSize(options.titleSize);
  doc.setFont('helvetica', 'bold');
  doc.text(puzzle.title || 'Crossword Puzzle', title_x, titleAuthor_y);

  //author
  doc.setFontSize(options.authorSize);
  doc.text(puzzle.author || '', author_x, titleAuthor_y, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  /* Render copyright */
  let copyright_x = DOC_WIDTH - margin;
  let copyright_y = DOC_HEIGHT - margin;
  doc.setFontSize(options.copyrightSize);
  doc.text(puzzle.copyright || '', copyright_x, copyright_y, { align: 'right' });

  /* Draw grid */

  drawGrid(doc, puzzle, grid_x, grid_y, gridWidth / puzzle.width);

  // Save with a default filename
  doc.save('crossword-puzzle.pdf');
}
