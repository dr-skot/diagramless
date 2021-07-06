import React from 'react';
import { capitalize } from '../utils/utils';

interface PuzzleHeaderProps {
  title: string;
  author: string;
}

export default function PuzzleHeader({ title, author }: PuzzleHeaderProps) {
  // TODO handle other title formats than NY Times
  // TODO do this munging on model
  const [maker, editor] = author?.split(' / ')?.map((name) => name.toUpperCase()) || [],
    titlePieces = title?.match(/NY Times, (\w+, \w+ \d+, \d+)(.*)/) || [],
    date = titlePieces[1] ? new Date(titlePieces[1]) : new Date(),
    dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }),
    monthDayYear = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    actualTitle = titlePieces[2].trim()
      ? '"' + capitalize(titlePieces[2].trim().toLowerCase()) + '"'
      : 'The Daily Crossword';

  return (
    <header className="PuzzleHeader-wrapper">
      <div className="PuzzleHeader-row">
        <div className="PuzzleHeader-puzzleDetailsContainer">
          <div className="PuzzleDetails-details">
            <div className="PuzzleDetails-date">
              <span>{dayOfWeek}</span> {monthDayYear}
            </div>
            <div className="PuzzleDetails-byline">
              {actualTitle}
              <span>By {maker}</span>
              <span>Edited by {editor}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
