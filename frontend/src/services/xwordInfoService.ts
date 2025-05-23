import { puzzleFromData } from '../model/puzzle';
import { XwdPuzzle } from '../model/puzzle';

// API base URL
const BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST;
const API_BASE_URL = BACKEND_HOST + '/api';

// XWordInfo JSON format interface
interface XWordInfoPuzzle {
  title: string;
  author: string;
  editor: string;
  copyright: string;
  publisher: string;
  date: string;
  notepad: string;
  size: {
    rows: number;
    cols: number;
  };
  grid: string[];
  gridnums: number[];
  circles?: number[];
  clues: {
    across: string[];
    down: string[];
  };
  answers: {
    across: string[];
    down: string[];
  };
}

/**
 * Convert a puzzle from XWordInfo JSON format to our application's format
 * @param xwordInfoData The puzzle data in XWordInfo JSON format
 * @returns A puzzle in our application's format
 */
export const puzzleFromXWordInfo = (xwordInfoData: XWordInfoPuzzle): XwdPuzzle | null => {
  if (!xwordInfoData) return null;

  // Solution is the grid
  const solution = xwordInfoData.grid;

  // Create empty guesses array
  const guesses = Array(solution.length).fill('-');

  // Convert clues from XWordInfo format to our format
  const clues: { number: string; direction: [number, number]; clue: string }[] = [];

  // Process across clues
  xwordInfoData.clues.across.forEach((clueText) => {
    // XWordInfo format is "1. Clue text"
    const match = clueText.match(/^(\d+)\.\s+(.+)$/);
    if (match) {
      const [, number, text] = match;
      clues.push({
        number,
        direction: [0, 1], // Across direction vector
        clue: text,
      });
    }
  });

  // Process down clues
  xwordInfoData.clues.down.forEach((clueText) => {
    // XWordInfo format is "1. Clue text"
    const match = clueText.match(/^(\d+)\.\s+(.+)$/);
    if (match) {
      const [, number, text] = match;
      clues.push({
        number,
        direction: [1, 0], // Down direction vector
        clue: text,
      });
    }
  });

  // Create puzzle data in our format
  const puzzleData = {
    date: xwordInfoData.date,
    label: 'XWordInfo',
    width: xwordInfoData.size.cols,
    height: xwordInfoData.size.rows,
    solution,
    guesses,
    clues,
    numbers: xwordInfoData.gridnums,
    author: xwordInfoData.editor
      ? `${xwordInfoData.author} / ${xwordInfoData.editor}`
      : xwordInfoData.author,
    title: xwordInfoData.title,
    copyright: xwordInfoData.copyright,
    note: xwordInfoData.notepad || '',
    extras: {
      // Add circles if they exist
      GEXT: xwordInfoData.circles
        ? solution.map((_, i) =>
            xwordInfoData.circles && xwordInfoData.circles[i] === 1 ? 0x80 : 0
          )
        : [],
    },
  };

  return puzzleFromData(puzzleData);
};

/**
 * Parse a JSON string from XWordInfo and convert it to our puzzle format
 * @param jsonString JSON string from XWordInfo
 * @returns A puzzle in our application's format
 */
export const parseXWordInfoJson = (jsonString: string): XwdPuzzle | null => {
  try {
    const xwordInfoData = JSON.parse(jsonString) as XWordInfoPuzzle;
    return puzzleFromXWordInfo(xwordInfoData);
  } catch (error) {
    console.error('Error parsing XWordInfo JSON:', error);
    return null;
  }
};

/**
 * Fetch a puzzle from XWordInfo by date
 */
export async function fetchPuzzle(date: string): Promise<XwdPuzzle | null> {
  try {
    // Ensure date is in MM/DD/YYYY format
    let formattedDate = date;
    if (date.includes('-')) {
      // Convert YYYY-MM-DD to MM/DD/YYYY
      const parts = date.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
      }
    }

    const apiUrl = `${API_BASE_URL}/puzzle?date=${encodeURIComponent(formattedDate)}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch puzzle: ${response.statusText}`);
    }

    const data = await response.json();
    return puzzleFromXWordInfo(data);
  } catch (error) {
    console.error('Error fetching puzzle from XWordInfo:', error);
    return null;
  }
}
