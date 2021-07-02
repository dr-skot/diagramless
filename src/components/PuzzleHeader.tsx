import React from 'react';
import { capitalize } from '../services/common/utils';

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
    <header className="PuzzleHeader-wrapper--3FN32">
      <div className="PuzzleHeader-row--3-nAI">
        <div className="PuzzleHeader-puzzleDetailsContainer--2L2k5">
          <div className="PuzzleDetails-details--1WqAl">
            <div className="PuzzleDetails-date--1HNzj">
              <span>{dayOfWeek}</span> {monthDayYear}
            </div>
            <div className="PuzzleDetails-byline--16J5w">
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
