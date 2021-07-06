// adapted from https://crosswordnexus.com/js/puz_functions.js
// (c) 2016 Alex Boisvert
// licensed under MIT license
// https://opensource.org/licenses/MIT

import JsPDF from 'jspdf';
import { XwdClue, XwdPuzzle } from '../model/puzzle';
import { XwdCell } from '../model/cell';
const isAcrossClue = (clue: XwdClue) => clue.direction === 'across';
const isDownClue = (clue: XwdClue) => clue.direction === 'down';

function drawSquare(doc: any, cell: XwdCell, x: number, y: number, size: number, color = 0.4) {
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
  doc.text(x + numberOffset, y + numberSize, cell.number);

  // letters
  doc.setFontSize(contentSize);
  doc.text(x + size / 2, y + contentOffset, cell.content, null, null, 'center');

  // circles
  if (cell.circle) {
    doc.circle(x + size / 2, y + size / 2, size / 2);
  }
}

function drawGrid(doc: JsPDF, puzzle: XwdPuzzle, x0: number, y0: number, cellSize: number) {
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
  let DEFAULT_OPTIONS = {
    margin: 20,
    title_pt: null,
    author_pt: null,
    copyright_pt: 8,
    num_columns: null,
    num_full_columns: null,
    column_padding: 10,
    gray: 0.55,
    under_title_spacing: 20,
    max_clue_pt: 14,
    min_clue_pt: 5,
    grid_padding: 5,
    outfile: null,
  };

  const options = { ...DEFAULT_OPTIONS, ..._options };

  // If there's no filename, just call it puz.pdf
  if (!options.outfile) options.outfile = 'puz.pdf';

  // If options.num_columns is null, we determine it ourselves
  if (!options.num_columns || !options.num_full_columns) {
    if (puzzle.height >= 17) {
      options.num_columns = 5;
      options.num_full_columns = 2;
    } else if (puzzle.width >= 17) {
      options.num_columns = 4;
      options.num_full_columns = 1;
    } else {
      options.num_columns = 3;
      options.num_full_columns = 1;
    }
  }

  // The maximum font size of title and author
  let max_title_author_pt = Math.max(options.title_pt, options.author_pt);

  let PTS_PER_IN = 72;
  let DOC_WIDTH = 8.5 * PTS_PER_IN;
  let DOC_HEIGHT = 11 * PTS_PER_IN;

  let margin = options.margin;

  let doc = new JsPDF('portrait', 'pt', 'letter');

  // create the clue strings and clue arrays
  let across_clues = ['ACROSS'];
  puzzle.clues.filter(isAcrossClue).forEach((clue) => {
    across_clues.push(`${clue.number}. ${clue.text}`);
  });

  // For space between clue lists
  across_clues.push('');

  let down_clues = ['DOWN'];
  // adapted to use diagramless puzzle data
  puzzle.clues.filter(isDownClue).forEach((clue, i) => {
    down_clues.push(`${clue.number}. ${clue.text}`);
  });

  // size of columns
  let col_width =
    (DOC_WIDTH - 2 * margin - (options.num_columns - 1) * options.column_padding) /
    options.num_columns;

  // The grid is under all but the first few columns
  let grid_width =
    DOC_WIDTH - 2 * margin - options.num_full_columns * (col_width + options.column_padding);
  let grid_height = (grid_width / puzzle.width) * puzzle.height;
  // x and y position of grid
  let grid_xpos = DOC_WIDTH - margin - grid_width;
  let grid_ypos = DOC_HEIGHT - margin - grid_height - options.copyright_pt;

  // Loop through and write to PDF if we find a good fit
  // Find an appropriate font size
  let clue_pt = options.max_clue_pt;
  let finding_font = true;
  let done = false;
  while (!done) {
    let clue_padding = clue_pt / 3;
    doc.setFontSize(clue_pt);

    // Print the clues
    let line_xpos = margin;
    let line_ypos =
      margin + max_title_author_pt + options.under_title_spacing + clue_pt + clue_padding;
    let my_column = 0;
    let clue_arrays = [across_clues, down_clues];
    for (let k = 0; k < clue_arrays.length; k++) {
      let clues = clue_arrays[k];
      for (let i = 0; i < clues.length; i++) {
        let clue = clues[i];
        // check to see if we need to wrap
        let max_line_ypos;
        if (my_column < options.num_full_columns) {
          max_line_ypos = DOC_HEIGHT - margin - options.copyright_pt;
        } else {
          max_line_ypos = grid_ypos - options.grid_padding;
        }

        // Split our clue
        let lines = doc.splitTextToSize(clue, col_width);

        if (line_ypos + (lines.length - 1) * (clue_pt + clue_padding) > max_line_ypos) {
          // move to new column
          my_column += 1;
          line_xpos = margin + my_column * (col_width + options.column_padding);
          line_ypos =
            margin + max_title_author_pt + options.under_title_spacing + clue_pt + clue_padding;
        }

        for (let j = 0; j < lines.length; j++) {
          // Set the font to bold for the title
          if (i === 0 && j === 0) {
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setFont('helvetica', 'normal');
          }
          let line = lines[j];
          // print the text
          console.debug(`doc.text(${line_xpos}, ${line_ypos}, ${line})`);
          if (!finding_font) doc.text(line_xpos, line_ypos, line);

          // set the y position for the next line
          line_ypos += clue_pt + clue_padding;
        }
      }
    }

    if (!finding_font) done = true;

    // let's not let the font get ridiculously tiny
    if (clue_pt === options.min_clue_pt) {
      finding_font = false;
    } else if (my_column > options.num_columns - 1) {
      clue_pt -= 0.1;
    } else {
      finding_font = false;
    }
  }

  console.log('found size', clue_pt);

  /***********************/

  // If title_pt or author_pt are null, we determine them
  let DEFAULT_TITLE_PT = 12;
  // let total_width = DOC_WIDTH - 2 * margin;
  if (!options.author_pt) options.author_pt = options.title_pt;
  if (!options.title_pt) {
    options.title_pt = DEFAULT_TITLE_PT;
    let finding_title_pt = true;
    while (finding_title_pt) {
      let title_author = puzzle.title + 'asdfasdf' + puzzle.author;
      doc.setFontSize(options.title_pt).setFont('helvetica', 'bold');
      let text_lines = doc.splitTextToSize(title_author, DOC_WIDTH); // should this be total_width?
      if (text_lines.length === 1) {
        finding_title_pt = false;
      } else {
        options.title_pt -= 1;
      }
    }
    options.author_pt = options.title_pt;
  }

  /* Render title and author */

  let title_xpos = margin;
  let author_xpos = DOC_WIDTH - margin;
  let title_author_ypos = margin + max_title_author_pt;
  //title
  doc.setFontSize(options.title_pt);
  doc.setFont('helvetica', 'bold');
  // @ts-ignore
  doc.text(title_xpos, title_author_ypos, puzzle.title);

  //author
  doc.setFontSize(options.author_pt);
  // @ts-ignore
  doc.text(author_xpos, title_author_ypos, puzzle.author, null, null, 'right');
  doc.setFont('helvetica', 'normal');

  /* Render copyright */
  let copyright_xpos = DOC_WIDTH - margin;
  let copyright_ypos = DOC_HEIGHT - margin;
  doc.setFontSize(options.copyright_pt);
  // @ts-ignore
  doc.text(copyright_xpos, copyright_ypos, puzzle.copyright, null, null, 'right');

  /* Draw grid */

  drawGrid(doc, puzzle, grid_xpos, grid_ypos, grid_width / puzzle.width);

  doc.save(options.outfile);
}
