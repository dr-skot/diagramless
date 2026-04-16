import { puzzleFromData } from '../model/puzzle';
import { XwdPuzzle } from '../model/puzzle';
import { puzzleFromXWordInfo } from '../parsers/xwordinfo';

// API base URL
const BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST;
const API_BASE_URL = BACKEND_HOST + '/api';

/**
 * Parse a JSON string from XWordInfo and convert it to our puzzle format
 */
export const parseXWordInfoJson = (jsonString: string): XwdPuzzle | null => {
  try {
    const xwordInfoData = JSON.parse(jsonString);
    const puzzleData = puzzleFromXWordInfo(xwordInfoData);
    return puzzleData ? puzzleFromData(puzzleData) : null;
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
    const puzzleData = puzzleFromXWordInfo(data);
    return puzzleData ? puzzleFromData(puzzleData) : null;
  } catch (error) {
    console.error('Error fetching puzzle from XWordInfo:', error);
    return null;
  }
}
