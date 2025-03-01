import { puzzleFromData } from '../model/puzzle';
import { XwdPuzzle } from '../model/puzzle';

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

  // Convert grid format from XWordInfo (array of strings) to our format
  // In XWordInfo format, '.' represents black squares
  const solution = xwordInfoData.grid.join('').split('');
  
  // Create empty guesses array
  const guesses = Array(solution.length).fill('-');
  
  // Convert clues from XWordInfo format to our format
  const clues: { number: string; direction: [number, number]; clue: string }[] = [];
  
  // Process across clues
  xwordInfoData.clues.across.forEach(clueText => {
    // XWordInfo format is "1. Clue text"
    const match = clueText.match(/^(\d+)\.\s+(.+)$/);
    if (match) {
      const [, number, text] = match;
      clues.push({
        number,
        direction: [0, 1], // Across direction vector
        clue: text
      });
    }
  });
  
  // Process down clues
  xwordInfoData.clues.down.forEach(clueText => {
    // XWordInfo format is "1. Clue text"
    const match = clueText.match(/^(\d+)\.\s+(.+)$/);
    if (match) {
      const [, number, text] = match;
      clues.push({
        number,
        direction: [1, 0], // Down direction vector
        clue: text
      });
    }
  });
  
  // Create puzzle data in our format
  const puzzleData = {
    label: 'XWordInfo',
    width: xwordInfoData.size.cols,
    height: xwordInfoData.size.rows,
    solution,
    guesses,
    clues,
    numbers: xwordInfoData.gridnums,
    author: xwordInfoData.author,
    title: xwordInfoData.title,
    copyright: xwordInfoData.copyright,
    note: xwordInfoData.notepad || '',
    extras: {
      // Add circles if they exist
      GEXT: xwordInfoData.circles ? 
        solution.map((_, i) => xwordInfoData.circles?.includes(i) ? 0x80 : 0) : 
        []
    }
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
 * Note: This function is provided as a reference, but it won't work directly
 * because XWordInfo requires authentication to access their API.
 * Users will need to manually download puzzles from XWordInfo and import them.
 * 
 * @param date Date in MM/DD/YYYY format
 * @returns A promise that resolves to a puzzle in our application's format
 */
export const fetchPuzzleFromXWordInfo = async (date: string): Promise<XwdPuzzle | null> => {
  try {
    // This URL is for reference only and won't work without proper authentication
    const url = `https://www.xwordinfo.com/JSON/Data.ashx?date=${date}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch puzzle: ${response.statusText}`);
    }
    
    const data = await response.json() as XWordInfoPuzzle;
    return puzzleFromXWordInfo(data);
  } catch (error) {
    console.error('Error fetching puzzle from XWordInfo:', error);
    return null;
  }
};
