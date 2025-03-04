// adapted from https://crosswordnexus.com/js/puz_functions.js
// (c) 2016 Alex Boisvert
// licensed under MIT license
// https://opensource.org/licenses/MIT

import { jsPDF } from 'jspdf';
import { XwdClue, XwdPuzzle } from '../model/puzzle';
import { XwdCell } from '../model/cell';
const isAcrossClue = (clue: XwdClue) => clue.direction === 'across';
const isDownClue = (clue: XwdClue) => clue.direction === 'down';
const clueText = (clue: XwdClue) => `${clue.number}. ${decodeHtmlEntities(clue.text)}`;

/**
 * Text style definition for styled text rendering
 */
type TextStyle = {
  font?: string;
  fontStyle?: string;
  size?: number;
};

/**
 * Styled text segment with content and styling information
 */
type StyledTextSegment = {
  text: string;
  style?: TextStyle;
};

type StyledText = StyledTextSegment[];

/**
 * Split styled text to fit within a specified width
 * @param {jsPDF} doc - jsPDF document instance
 * @param {Array<StyledTextSegment>} styledText - Array of text segments with style information
 * @param {number} maxWidth - Maximum width for the text
 * @returns {Array<Array<StyledTextSegment>>} Array of lines with styled segments
 */
function splitStyledTextToSize(doc: jsPDF, styledText: StyledText, maxWidth: number): StyledText[] {
  // Result will be an array of lines, where each line contains styled segments
  const lines: Array<Array<StyledTextSegment>> = [[]];
  let currentLine = 0;
  let currentLineWidth = 0;

  // Process each segment
  for (let i = 0; i < styledText.length; i++) {
    const segment = styledText[i];
    const text = segment.text;
    const style = segment.style || {};

    // Save current font state
    const currentFontSize = doc.getFontSize();
    const currentFontName = doc.getFont().fontName;
    const currentFontStyle = doc.getFont().fontStyle;

    // Apply segment style
    if (style.font) doc.setFont(style.font, style.fontStyle || 'normal');
    else if (style.fontStyle) doc.setFont(currentFontName, style.fontStyle);
    if (style.size) doc.setFontSize(style.size);

    // Split segment's text into words
    const words = text.split(/\s+/);
    let currentSegmentText = '';

    // Process each word
    for (let j = 0; j < words.length; j++) {
      const word = words[j];
      const wordWidth = doc.getStringUnitWidth(word) * doc.getFontSize() / doc.internal.scaleFactor;
      const spaceWidth = j < words.length - 1 ? doc.getStringUnitWidth(' ') * doc.getFontSize() / doc.internal.scaleFactor : 0;

      // Check if word fits in current line
      if (currentLineWidth + wordWidth <= maxWidth) {
        // Add word to current segment
        currentSegmentText += word;
        currentLineWidth += wordWidth;

        // Add space if not the last word and there's room for it
        if (j < words.length - 1) {
          if (currentLineWidth + spaceWidth <= maxWidth) {
            currentSegmentText += ' ';
            currentLineWidth += spaceWidth;
          } else {
            // Space doesn't fit, move to next line
            lines[currentLine].push({
              text: currentSegmentText,
              style: { ...style }
            });
            currentLine++;
            lines[currentLine] = [];
            currentLineWidth = 0;
            currentSegmentText = '';
          }
        }
      } else {
        // Word doesn't fit, finish current segment if it has text
        if (currentSegmentText.length > 0) {
          lines[currentLine].push({
            text: currentSegmentText,
            style: { ...style }
          });
          currentSegmentText = '';
        }

        // Start new line
        currentLine++;
        lines[currentLine] = [];
        currentLineWidth = 0;

        // Handle case where single word is too long for a line
        if (wordWidth > maxWidth) {
          // Character-by-character splitting for long words
          let charIndex = 0;
          while (charIndex < word.length) {
            let charCount = 0;
            let charWidth = 0;

            // Find how many characters fit
            while (charIndex + charCount < word.length &&
            charWidth + doc.getStringUnitWidth(word[charIndex + charCount]) * doc.getFontSize() / doc.internal.scaleFactor <= maxWidth) {
              charWidth += doc.getStringUnitWidth(word[charIndex + charCount]) * doc.getFontSize() / doc.internal.scaleFactor;
              charCount++;
            }

            // Add this chunk to line
            if (charCount > 0) {
              const wordPart = word.substr(charIndex, charCount);
              lines[currentLine].push({
                text: wordPart,
                style: { ...style }
              });
              charIndex += charCount;

              // If more characters remain, start a new line
              if (charIndex < word.length) {
                currentLine++;
                lines[currentLine] = [];
                currentLineWidth = 0;
              } else if (j < words.length - 1) {
                // Add space if not the last word
                currentSegmentText = ' ';
                currentLineWidth = doc.getStringUnitWidth(' ') * doc.getFontSize() / doc.internal.scaleFactor;
              }
            } else {
              // Even a single character won't fit, force it on the line
              const wordPart = word.substr(charIndex, 1);
              lines[currentLine].push({
                text: wordPart,
                style: { ...style }
              });
              charIndex += 1;

              currentLine++;
              lines[currentLine] = [];
              currentLineWidth = 0;
            }
          }
        } else {
          // Word fits on a new line by itself
          currentSegmentText = word;
          if (j < words.length - 1) {
            currentSegmentText += ' ';
          }
          currentLineWidth = wordWidth + (j < words.length - 1 ? spaceWidth : 0);
        }
      }
    }

    // Add any remaining text in the current segment
    if (currentSegmentText.length > 0) {
      lines[currentLine].push({
        text: currentSegmentText,
        style: { ...style }
      });
    }

    // Restore font state
    doc.setFont(currentFontName, currentFontStyle);
    doc.setFontSize(currentFontSize);
  }

  // Remove empty lines
  return lines.filter(line => line.length > 0);
}

/**
 * Render styled text that has been split into multiple lines
 * @param {jsPDF} doc - jsPDF document instance
 * @param {StyledText[]} lines - Array of lines with styled segments from splitStyledTextToSize
 * @param {number} x - X position to start rendering
 * @param {number} y - Y position to start rendering
 * @param {number} lineHeight - Height between lines
 * @param {TextAlignment} [align='left'] - Text alignment: 'left', 'center', or 'right'
 */
function renderStyledTextLines(
  doc: jsPDF, 
  lines: StyledText[], 
  x: number, 
  y: number, 
  lineHeight: number,
  align: TextAlignment = 'left'
) {
  let currentY = y;

  // Process each line
  lines.forEach(line => {
    // Use setStyledText to render each line
    setStyledText(doc, line, x, currentY, align);
    
    // Move to next line
    currentY += lineHeight;
  });
}

/**
 * Render styled text that has been split to fit width
 * @param {jsPDF} doc - jsPDF document instance
 * @param {Array<Array<StyledTextSegment>>} lines - Array of lines with styled segments from splitStyledTextToSize
 * @param {number} x - X position to start rendering
 * @param {number} y - Y position to start rendering
 * @param {number} lineHeight - Height between lines
 */
function renderStyledText(doc: jsPDF, lines: StyledText[], x: number, y: number, lineHeight: number) {
  let currentY = y;

  // Save current font state
  const originalFontSize = doc.getFontSize();
  const originalFontName = doc.getFont().fontName;
  const originalFontStyle = doc.getFont().fontStyle;
  
  // Process each line
  lines.forEach(line => {
    let currentX = x;

    // Process each segment in the line
    line.forEach(segment => {
      const text = segment.text;
      const style = segment.style || {};

      // Apply segment style
      if (style.font) doc.setFont(style.font, style.fontStyle || 'normal');
      else if (style.fontStyle) doc.setFont(originalFontName, style.fontStyle);
      if (style.size) doc.setFontSize(style.size);

      // Draw text
      doc.text(text, currentX, currentY);

      // Move x position for next segment
      currentX += doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
    });

    // Move to next line
    currentY += lineHeight;
  });

  // Restore font state
  doc.setFont(originalFontName, originalFontStyle);
  doc.setFontSize(originalFontSize);
}

/**
 * Decode HTML entities in a string
 */
function decodeHtmlEntities(text: string): string {
  const entities = [
    ['&amp;', '&'],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&quot;', '"'],
    ['&apos;', "'"],
    ['&#39;', "'"],
  ];
  entities.forEach(([entity, replacement]) => {
    text = text.replace(new RegExp(entity, 'g'), replacement);
  });
  return text;
}

/**
 * Convert an HTML string with basic formatting to a StyledText array
 * Supports <i>, <em>, <b>, and <strong> tags
 * @param {string} html - HTML string to convert
 * @param {string} font - Base font to use
 * @param {number} size - Base font size
 * @returns {StyledText} Array of styled text segments
 */
function htmlToStyledText(html: string, font: string, size: number): StyledText {
  // Decode HTML entities first
  const decodedHtml = decodeHtmlEntities(html);
  
  // Define the supported tags and their corresponding font styles
  const italicTags = ['<i>', '</i>', '<em>', '</em>'];
  const boldTags = ['<b>', '</b>', '<strong>', '</strong>'];
  
  // Create a mapping of opening tags to their corresponding font style
  const tagToFontStyle: Record<string, string> = {
    '<i>': 'italic',
    '<em>': 'italic',
    '<b>': 'bold',
    '<strong>': 'bold'
  };
  
  // Create a mapping of closing tags to their corresponding opening tags
  const closingToOpeningTag: Record<string, string> = {
    '</i>': '<i>',
    '</em>': '<em>',
    '</b>': '<b>',
    '</strong>': '<strong>'
  };
  
  // Initialize the result array and current style
  const result: StyledTextSegment[] = [];
  let currentStyle: TextStyle = { font, size, fontStyle: 'normal' };
  
  // Split the HTML string into segments based on the tags
  const allTags = [...italicTags, ...boldTags];
  const tagPattern = new RegExp(`(${allTags.map(tag => tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  
  // Split by tags but keep the tags in the result
  const segments = decodedHtml.split(tagPattern);
  
  let currentText = '';
  let activeItalic = false;
  let activeBold = false;
  
  // Process each segment
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    // If the segment is a tag
    if (allTags.includes(segment)) {
      // If we have accumulated text, add it to the result with the current style
      if (currentText) {
        result.push({
          text: currentText,
          style: { ...currentStyle }
        });
        currentText = '';
      }
      
      // If it's an opening tag
      if (tagToFontStyle[segment]) {
        // Update active styles
        if (italicTags.includes(segment) && segment.startsWith('<') && !segment.startsWith('</')) {
          activeItalic = true;
        }
        if (boldTags.includes(segment) && segment.startsWith('<') && !segment.startsWith('</')) {
          activeBold = true;
        }
      } 
      // If it's a closing tag
      else if (closingToOpeningTag[segment]) {
        // Update active styles
        if (italicTags.includes(segment) && segment.startsWith('</')) {
          activeItalic = false;
        }
        if (boldTags.includes(segment) && segment.startsWith('</')) {
          activeBold = false;
        }
      }
      
      // Determine the current font style based on active styles
      if (activeBold && activeItalic) {
        currentStyle.fontStyle = 'bolditalic';
      } else if (activeBold) {
        currentStyle.fontStyle = 'bold';
      } else if (activeItalic) {
        currentStyle.fontStyle = 'italic';
      } else {
        currentStyle.fontStyle = 'normal';
      }
    } 
    // If the segment is text
    else {
      currentText += segment;
    }
  }
  
  // Add any remaining text
  if (currentText) {
    result.push({
      text: currentText,
      style: { ...currentStyle }
    });
  }
  
  return result;
}

/**
 * Alignment options for styled text
 */
type TextAlignment = 'left' | 'center' | 'right';

/**
 * Render styled text at the specified position with alignment options
 * @param {jsPDF} doc - jsPDF document instance
 * @param {StyledText} styledText - Array of styled text segments (single line)
 * @param {number} x - X position to start rendering
 * @param {number} y - Y position to start rendering
 * @param {TextAlignment} [align='left'] - Text alignment: 'left', 'center', or 'right'
 */
function setStyledText(
  doc: jsPDF, 
  styledText: StyledText, 
  x: number, 
  y: number, 
  align: TextAlignment = 'left'
): void {
  // Save current font state
  const originalFontSize = doc.getFontSize();
  const originalFontName = doc.getFont().fontName;
  const originalFontStyle = doc.getFont().fontStyle;
  
  // Calculate total width for alignment
  let totalWidth = 0;
  if (align === 'center' || align === 'right') {
    // We need to calculate the total width of all segments
    styledText.forEach(segment => {
      const { text, style = {} } = segment;
      
      // Temporarily apply segment style to calculate width
      if (style.font) doc.setFont(style.font, style.fontStyle || 'normal');
      else if (style.fontStyle) doc.setFont(originalFontName, style.fontStyle);
      if (style.size) doc.setFontSize(style.size);
      
      // Calculate segment width
      totalWidth += doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
      
      // Restore original font settings
      doc.setFont(originalFontName, originalFontStyle);
      doc.setFontSize(originalFontSize);
    });
  }
  
  // Calculate starting X position based on alignment
  let startX = x;
  if (align === 'center') {
    startX = x - (totalWidth / 2);
  } else if (align === 'right') {
    startX = x - totalWidth;
  }
  
  // Current X position for rendering
  let currentX = startX;
  
  // Process each segment
  styledText.forEach(segment => {
    const { text, style = {} } = segment;
    
    // Apply segment style
    if (style.font) doc.setFont(style.font, style.fontStyle || 'normal');
    else if (style.fontStyle) doc.setFont(originalFontName, style.fontStyle);
    if (style.size) doc.setFontSize(style.size);
    
    // Draw text
    doc.text(text, currentX, y);
    
    // Move x position for next segment
    currentX += doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
  });
  
  // Restore original font state
  doc.setFont(originalFontName, originalFontStyle);
  doc.setFontSize(originalFontSize);
}

function drawSquare(doc: any, cell: XwdCell, x: number, y: number, size: number, color = 0.6) {
  const numberOffset = size / 20;
  const numberSize = size / 3.5;
  const contentOffset = size * (4 / 5);
  const contentSize = size / (1.5 + 0.5 * (cell.content.length - 1));

  doc.setFillColor(color.toString());
  doc.setDrawColor(color.toString());

  doc.rect(x, y, size, size, cell.isBlack ? 'FD' : 'D');

  if (cell.isBlack) return;

  // Skip printing numbers
  // doc.setFontSize(numberSize);
  // doc.text(cell.number.toString(), x + numberOffset, y + numberSize);

  // letters
  doc.setFontSize(contentSize);
  doc.text(decodeHtmlEntities(cell.content), x + size / 2, y + contentOffset, { align: 'center' });

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

        // Convert HTML in clue to styled text
        const styledText = i === 0 
          ? [{ text: clue, style: { font: 'helvetica', fontStyle: 'bold', size: clueSize } }] // For headers (ACROSS/DOWN)
          : htmlToStyledText(clue, 'helvetica', clueSize); // For regular clues
        
        // Split our clue
        const lines = splitStyledTextToSize(doc, styledText, colWidth);

        if (line_y + (lines.length - 1) * (clueSize + cluePadding) > max_line_y) {
          // move to new column
          columnNumber += 1;
          line_x = margin + columnNumber * (colWidth + options.columnPadding);
          line_y =
            margin + maxTitleAuthorSize + options.underTitleSpacing + clueSize + cluePadding;
        }

        lines.forEach((line, j) => {
          if (!sizingFont) {
            // Render the line using setStyledText
            setStyledText(doc, line, line_x, line_y);
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
  doc.text(decodeHtmlEntities(puzzle.title) || 'Crossword Puzzle', title_x, titleAuthor_y);

  //author
  doc.setFontSize(options.authorSize);
  doc.text(decodeHtmlEntities(puzzle.author) || '', author_x, titleAuthor_y, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  /* Render copyright */
  let copyright_x = DOC_WIDTH - margin;
  let copyright_y = DOC_HEIGHT - margin;
  doc.setFontSize(options.copyrightSize);
  doc.text(decodeHtmlEntities(puzzle.copyright) || '', copyright_x, copyright_y, { align: 'right' });

  /* Draw grid */

  drawGrid(doc, puzzle, grid_x, grid_y, gridWidth / puzzle.width);

  // Save with a default filename
  doc.save('crossword-puzzle.pdf');
}

const DEFAULT_TITLE_SIZE = 12;
const PTS_PER_IN = 72;
const DOC_WIDTH = 8.5 * PTS_PER_IN;
const DOC_HEIGHT = 11 * PTS_PER_IN;
