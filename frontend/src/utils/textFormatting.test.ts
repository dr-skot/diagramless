import { parseTitle, parseAuthor } from './textFormatting';

describe('parseTitle', () => {
  it('handles simple cases', () => {
    expect(parseTitle('New York Times, Tuesday, April 26, 2022')).toEqual({
      title: 'The Crossword',
      date: new Date('4/26/2022'),
      dayOfWeek: 'Tuesday',
      monthDayYear: 'April 26, 2022',
    });
  });

  it('returns title as-is if no date pattern', () => {
    expect(parseTitle('Some Random Title').title).toBe('Some Random Title');
  });

  it('uses dateStr parameter when provided', () => {
    const result = parseTitle('Some Title', '01/15/2025');
    expect(result.date).toEqual(new Date('01/15/2025'));
  });
});

describe('parseAuthor', () => {
  it('parses author and editor', () => {
    expect(parseAuthor('Jane Doe / Will Shortz')).toEqual({
      maker: 'JANE DOE',
      editor: 'WILL SHORTZ',
    });
  });

  it('handles author without editor', () => {
    expect(parseAuthor('Jane Doe')).toEqual({
      maker: 'JANE DOE',
      editor: '',
    });
  });
});
