import React, { useState, useRef, useEffect } from 'react';
import { fetchAvailablePuzzles, fetchPuzzleFromXWordInfo, fetchPuzzleByFilename } from '../services/xwordInfoService';
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
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    // Handle escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onCancel]);

  const handleDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      setError('Please enter a date');
      return;
    }
    
    // Parse the date string and adjust for timezone issues
    // The date input returns YYYY-MM-DD format
    const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
    
    // Create date parts directly without timezone conversion issues
    // Month is 0-indexed in JavaScript Date, so we use the parsed values directly
    const formattedDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    
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
    <div className="xwordinfo-importer" ref={modalRef} onKeyDown={handleKeyDown}>
      <button className="close-button" onClick={onCancel} aria-label="Close">×</button>
      
      <form onSubmit={handleDateSubmit} className="date-form">
        <div className="form-group">
          <label htmlFor="date">Puzzle date:</label>
          <input
            type="date"
            id="date"
            ref={dateInputRef}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            onKeyDown={handleKeyDown}
          />
        </div>
        <button type="submit" disabled={loading} onKeyDown={handleKeyDown}>
          {loading ? 'Loading...' : 'Load Puzzle'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
