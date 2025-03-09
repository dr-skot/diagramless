import React, { useState, useRef, useEffect } from 'react';
import './LoadPuzzleModal.css';
import { formatDate } from '../utils/dateUtils';

interface LoadPuzzleModalProps {
  onSubmit: (date: Date) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
  defaultDate?: Date;
}

function dateFromInput(date: string) {
  // date string is format 'YYYY-MM-DD'
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function LoadPuzzleModal(props: LoadPuzzleModalProps) {
  const { onSubmit, onCancel, error: initialError, loading, defaultDate = new Date() } = props;
  const [error, setError] = useState<string>(initialError || '');
  const [date, setDate] = useState(formatDate('YYYY-MM-DD', defaultDate));

  // Update date when defaultDate changes
  useEffect(() => setDate(formatDate('YYYY-MM-DD', defaultDate)), [defaultDate]);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus the date input when the component mounts
  useEffect(() => {
    setTimeout(() => dateInputRef.current?.focus(), 100);
  }, []);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!modalRef.current?.contains(event.target as Node)) onCancel();
    };
    // Handle escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
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

    if (!date) setError('Please enter a date');
    else onSubmit(dateFromInput(date));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="load-puzzle-modal" ref={modalRef} onKeyDown={handleKeyDown}>
      <button className="close-button" onClick={onCancel} aria-label="Close">
        ×
      </button>

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
}
