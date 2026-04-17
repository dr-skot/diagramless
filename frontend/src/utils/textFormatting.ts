export function parseTitle(title: string, dateStr?: string) {
  // Handle different title formats, including "New York Times, Tuesday, April 26, 2022"
  let titlePieces = title.match(/(?:NY|New York) Times,\s+(\w+,\s+\w+\s+\d+,\s+\d+)(.*)/);
  if (!titlePieces || titlePieces.length < 2) {
    titlePieces = title.match(/(\w+,\s+\w+\s+\d+,\s+\d+)(.*)/);
  }
  dateStr ||= titlePieces?.[1] || '';

  let date = dateStr ? new Date(dateStr) : undefined;
  if (date && isNaN(date.getTime())) date = undefined;

  const actualTitle = titlePieces ? titlePieces[2]?.trim() || "The Daily Crossword" : title;

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
  const authorParts = author?.split(' / ') || [];
  const maker = authorParts[0]?.toUpperCase() || 'Unknown';
  const editor = authorParts[1]?.toUpperCase() || '';
  return { maker, editor };
}
