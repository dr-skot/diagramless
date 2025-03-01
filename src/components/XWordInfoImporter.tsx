import React, { useState, useRef, useEffect } from 'react';
import { puzzleFromXWordInfo, fetchAvailablePuzzles, fetchPuzzleFromXWordInfo, fetchPuzzleByFilename } from '../services/xwordInfoService';
import { XwdPuzzle } from '../model/puzzle';
import './XWordInfoImporter.css';

interface XWordInfoImporterProps {
  onImport: (puzzle: XwdPuzzle) => void;
  onCancel: () => void;
}

export const XWordInfoImporter: React.FC<XWordInfoImporterProps> = ({ onImport, onCancel }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [availablePuzzles, setAvailablePuzzles] = useState<{ date: string; filename: string }[]>([]);
  
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Fetch available puzzles when component mounts
  useEffect(() => {
    const loadPuzzles = async () => {
      try {
        const puzzles = await fetchAvailablePuzzles();
        setAvailablePuzzles(puzzles);
      } catch (error) {
        console.error('Error loading available puzzles:', error);
        setError('Failed to load available puzzles. The API server might not be running.');
      }
    };
    
    loadPuzzles();
  }, []);

  // Focus the date input when the component mounts
  useEffect(() => {
    if (dateInputRef.current) {
      setTimeout(() => {
        dateInputRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      setError('Please enter a date');
      return;
    }
    
    // Validate date format
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = date.match(dateRegex);
    
    if (!match) {
      setError('Please enter a valid date in MM/DD/YYYY format');
      return;
    }
    
    const [_, month, day, year] = match;
    const formattedDate = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
    
    setError(null);
    setLoading(true);
    
    try {
      // Check if we have a cached puzzle for this date
      const cachedPuzzle = availablePuzzles.find(puzzle => puzzle.date === formattedDate);
      
      if (cachedPuzzle) {
        // If we have a cached puzzle, use it
        console.log(`Using cached puzzle for date: ${formattedDate}, filename: ${cachedPuzzle.filename}`);
        const puzzle = await fetchPuzzleByFilename(cachedPuzzle.filename);
        if (puzzle) {
          onImport(puzzle);
          return;
        }
      }
      
      // If no cached puzzle or failed to load it, fetch from XWordInfo
      console.log(`Fetching puzzle for date: ${formattedDate}`);
      const puzzle = await fetchPuzzleFromXWordInfo(formattedDate);
      if (puzzle) {
        onImport(puzzle);
      } else {
        setError('Failed to fetch puzzle for the given date. Please check the date and try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      setError('Failed to fetch puzzle. Make sure the API server is running and the date is valid.');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="xwordinfo-importer" onKeyDown={handleKeyDown}>
      <h2>Load</h2>
      
      <form onSubmit={handleDateSubmit} className="date-form">
        <div className="form-group">
          <label htmlFor="date">Date (MM/DD/YYYY):</label>
          <input
            type="text"
            id="date"
            ref={dateInputRef}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="MM/DD/YYYY"
            pattern="\d{2}/\d{2}/\d{4}"
            required
            onKeyDown={handleKeyDown}
          />
        </div>
        <button type="submit" disabled={loading} onKeyDown={handleKeyDown}>
          {loading ? 'Loading...' : 'Load'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="button-row">
        <button type="button" onClick={onCancel} onKeyDown={handleKeyDown}>Cancel</button>
      </div>
    </div>
  );
};
