import { XwdPuzzle } from '../model/puzzle';
import { ACROSS, DOWN, Vector } from '../model/navigation';
import { formatDate } from '../utils/dateUtils';

export function parseRelatedClues(clue: string) {
  const regex = /(\d+-(,|\/|,? and|,? or) ?)*\d+-(Across|Down)/gi;
  const matches = clue.match(regex) || [];
  return matches
    .map((match) => {
      const numbers = match.match(/\d+/g);
      const direction = match.match(/across/i) ? ACROSS : DOWN;
      return numbers!.map((number) => {
        return { number, direction };
      });
    })
    .flat();
}

export function parseTitle(title: string, dateStr?: string) {
  let date = dateStr ? new Date(dateStr) : undefined;
  if (date && isNaN(date.getTime())) date = undefined;

  // Handle different title formats, including "New York Times, Tuesday, April 26, 2022"
  let titlePieces = title.match(/(?:NY|New York) Times,\s+(\w+,\s+\w+\s+\d+,\s+\d+)(.*)/);
  if (!titlePieces || titlePieces.length < 2) {
    // Try another format that might be used
    titlePieces = title.match(/(\w+,\s+\w+\s+\d+,\s+\d+)(.*)/);
  }
  dateStr ||= titlePieces?.[1] || '';

  // For standard NYT format (just date), use "The Crossword"
  const actualTitle = titlePieces ? titlePieces[2]?.trim() || "The Crossword" : title;

  const dayOfWeek = date?.toLocaleDateString('en-US', { weekday: 'long' }) || '';
  const monthDayYear =
    date?.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) || 'Crossword';

  return { title: actualTitle, date, dayOfWeek, monthDayYear };
}

export function parseAuthor(author: string) {
  // Parse author and editor
  const authorParts = author?.split(' / ') || [];
  const maker = authorParts[0]?.toUpperCase() || 'Unknown';
  const editor = authorParts[1]?.toUpperCase() || '';
  return { maker, editor };
}

export function getPuzzleDate(puzzle: XwdPuzzle) {
  let date = '';
  if (puzzle.date) return puzzle.date;
  if (puzzle.title) {
    const titleDate = parseTitle(puzzle.title).date;
    if (titleDate) date = formatDate('MM/DD/YYYY', titleDate);
  }
  return date;
}
