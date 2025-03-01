import React, { useState, useRef, useEffect } from 'react';
import { puzzleFromXWordInfo, fetchAvailablePuzzles, fetchPuzzleFromXWordInfo, fetchPuzzleByFilename } from '../services/xwordInfoService';
import { XwdPuzzle } from '../model/puzzle';
import './XWordInfoImporter.css';

interface XWordInfoImporterProps {
  onImport: (puzzle: XwdPuzzle) => void;
  onCancel: () => void;
}

export const XWordInfoImporter: React.FC<XWordInfoImporterProps> = ({ onImport, onCancel }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [availablePuzzles, setAvailablePuzzles] = useState<{ date: string; filename: string }[]>([]);
  const [apiMode, setApiMode] = useState<'date' | 'file' | 'manual'>('date');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Focus the date input when the date tab is selected
  useEffect(() => {
    if (apiMode === 'date' && dateInputRef.current) {
      setTimeout(() => {
        dateInputRef.current?.focus();
      }, 100);
    }
  }, [apiMode]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    setError(null);
    setLoading(true);
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);
        const puzzle = puzzleFromXWordInfo(data);
        onImport(puzzle);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        setError('Failed to parse JSON file. Make sure it\'s a valid XWordInfo puzzle file.');
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

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

  const handleFileSelect = async (filename: string) => {
    setSelectedFile(filename);
    setError(null);
    setLoading(true);
    
    try {
      const puzzle = await fetchPuzzleByFilename(filename);
      if (puzzle) {
        onImport(puzzle);
      } else {
        setError('Failed to fetch puzzle file');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching puzzle file:', error);
      setError('Failed to fetch puzzle file. Make sure the API server is running.');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="xwordinfo-importer" onKeyDown={handleKeyDown}>
      <h2>Import from XWordInfo</h2>
      
      <div className="import-tabs">
        <button 
          className={apiMode === 'date' ? 'active' : ''} 
          onClick={() => setApiMode('date')}
          onKeyDown={handleKeyDown}
        >
          Fetch by Date
        </button>
        <button 
          className={apiMode === 'file' ? 'active' : ''} 
          onClick={() => setApiMode('file')}
          onKeyDown={handleKeyDown}
        >
          Select Cached Puzzle
        </button>
        <button 
          className={apiMode === 'manual' ? 'active' : ''} 
          onClick={() => setApiMode('manual')}
          onKeyDown={handleKeyDown}
        >
          Upload JSON File
        </button>
      </div>
      
      {apiMode === 'date' && (
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
            {loading ? 'Fetching...' : 'Fetch Puzzle'}
          </button>
        </form>
      )}
      
      {apiMode === 'file' && (
        <div className="file-selector">
          <h3>Select a Cached Puzzle</h3>
          {availablePuzzles.length > 0 ? (
            <ul className="puzzle-list">
              {availablePuzzles.map((puzzle) => (
                <li 
                  key={puzzle.filename} 
                  className={selectedFile === puzzle.filename ? 'selected' : ''}
                  onClick={() => handleFileSelect(puzzle.filename)}
                  onKeyDown={handleKeyDown}
                >
                  {puzzle.date}
                </li>
              ))}
            </ul>
          ) : (
            <p>No cached puzzles available. Fetch a puzzle by date first.</p>
          )}
        </div>
      )}
      
      {apiMode === 'manual' && (
        <div 
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            id="file-input"
            accept=".json"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          
          <div className="drop-content">
            <p>Drag and drop a XWordInfo JSON file here</p>
            <p>or</p>
            <button 
              type="button" 
              className="file-button"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={handleKeyDown}
            >
              Select File
            </button>
          </div>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="info-section">
        <h3>How to use this importer</h3>
        <p>
          This tool allows you to import puzzles from XWordInfo in three ways:
        </p>
        <ol>
          <li>Fetch a puzzle by date (MM/DD/YYYY format) directly from the API server</li>
          <li>Select from previously fetched puzzles that are cached on the server</li>
          <li>Upload a JSON file that you've downloaded from XWordInfo</li>
        </ol>
        <p>
          <strong>Note:</strong> The API server must be running to use the first two options.
          Run <code>python scripts/xwordinfo_api.py</code> from the project root to start the server.
        </p>
      </div>
      
      <div className="button-row">
        <button type="button" onClick={onCancel} onKeyDown={handleKeyDown}>Cancel</button>
      </div>
    </div>
  );
};
