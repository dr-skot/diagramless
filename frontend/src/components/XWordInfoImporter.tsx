import React, { useState, useRef, useEffect } from 'react';
import { fetchPuzzleFromXWordInfo } from '../services/xwordInfoService';
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
  
  const dateInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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
