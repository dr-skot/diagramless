import React from 'react';
import { XwdClue } from '../model/puzzle';

interface ClueBarProps {
  clue?: XwdClue | null;
  width: number;
}

export default function ClueBar({ clue, width }: ClueBarProps) {
  return (
    <div className="cluebar" style={{ width }}>
      <span className="cluebar-number">{clue?.number}</span>
      <span 
        className="cluebar-text" 
        dangerouslySetInnerHTML={{ __html: clue?.text || '' }}
      ></span>
    </div>
  );
}
