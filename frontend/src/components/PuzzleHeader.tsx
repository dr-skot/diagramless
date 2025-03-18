import React from 'react';
import { parseAuthor, parseTitle } from '../services/xwdService';

interface PuzzleHeaderProps {
  title: string;
  author: string;
  date?: string;
}

export default function PuzzleHeader(props: PuzzleHeaderProps) {
  const { title, dayOfWeek, monthDayYear } = parseTitle(props.title, props.date);
  const { maker, editor } = parseAuthor(props.author);

  return (
    <header className="PuzzleHeader-wrapper">
      <div className="PuzzleHeader-row">
        <div className="PuzzleHeader-puzzleDetailsContainer">
          <div className="PuzzleDetails-details">
            <div className="PuzzleDetails-date">
              <span>{title}</span> {dayOfWeek}, {monthDayYear}
            </div>
            <div className="PuzzleDetails-byline">
              By {maker}
              {editor && <span>Edited by {editor}</span>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
