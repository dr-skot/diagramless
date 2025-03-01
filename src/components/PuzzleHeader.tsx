import React from 'react';
import { capitalize } from '../utils/utils';

interface PuzzleHeaderProps {
  title: string;
  author: string;
}

export default function PuzzleHeader({ title, author }: PuzzleHeaderProps) {
  // Parse author and editor
  const authorParts = author?.split(' / ') || [];
  const maker = authorParts[0]?.toUpperCase() || 'Unknown';
  const editor = authorParts[1]?.toUpperCase() || '';
  
  // Parse title
  // Handle different title formats, including "New York Times, Tuesday, April 26, 2022"
  let titlePieces = title?.match(/(?:NY|New York) Times,\s+(\w+,\s+\w+\s+\d+,\s+\d+)(.*)/) || [];
  if (!titlePieces || titlePieces.length < 2) {
    // Try another format that might be used
    titlePieces = title?.match(/(\w+,\s+\w+\s+\d+,\s+\d+)(.*)/) || [];
  }
  
  // Parse date
  const dateStr = titlePieces[1] || '';
  const date = dateStr ? new Date(dateStr) : new Date();
  const isValidDate = !isNaN(date.getTime());
  
  // Format date parts
  const dayOfWeek = isValidDate 
    ? date.toLocaleDateString('en-US', { weekday: 'long' })
    : '';
  const monthDayYear = isValidDate
    ? date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : title || 'Crossword Puzzle'; // Fallback to title or generic name
  
  // Get actual title (part after the date)
  const actualTitleText = titlePieces[2]?.trim() || '';
  const actualTitle = actualTitleText
    ? '"' + capitalize(actualTitleText.toLowerCase()) + '"'
    : 'The Daily Crossword';

  return (
    <header className="PuzzleHeader-wrapper">
      <div className="PuzzleHeader-row">
        <div className="PuzzleHeader-puzzleDetailsContainer">
          <div className="PuzzleDetails-details">
            <div className="PuzzleDetails-date">
              {dayOfWeek && <span>{dayOfWeek}</span>} {monthDayYear}
            </div>
            <div className="PuzzleDetails-byline">
              {actualTitle}
              <span>By {maker}</span>
              {editor && <span>Edited by {editor}</span>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
