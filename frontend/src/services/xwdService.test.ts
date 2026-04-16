import {
  parseRelatedClues,
  parseTitle,
} from './xwdService';
import { DOWN, ACROSS } from '../model/navigation';

describe('parseRelatedClues', () => {
  it('finds simple cases', () => {
    expect(parseRelatedClues('blah blah 18-Down blah 25-Across blarf')).toEqual([
      { direction: DOWN, number: '18' },
      { direction: ACROSS, number: '25' },
    ]);
  });
  it('finds complicated cases', () => {
    expect(parseRelatedClues('blah blah 18-, 20-, and 25-Across blarf')).toEqual([
      { direction: ACROSS, number: '18' },
      { direction: ACROSS, number: '20' },
      { direction: ACROSS, number: '25' },
    ]);
  });
  it("doesn't choke on nothing", () => {
    expect(parseRelatedClues('blah blah blah')).toEqual([]);
  });
  it('corectly parses a clue with a slash', () => {
    const clue =
      "Slogan that celebrates a young woman's confidence and independence ... or a hint to 17-, 24-, 40-/41- and 49-Across";
    expect(parseRelatedClues(clue)).toEqual([
      { direction: ACROSS, number: '17' },
      { direction: ACROSS, number: '24' },
      { direction: ACROSS, number: '40' },
      { direction: ACROSS, number: '41' },
      { direction: ACROSS, number: '49' },
    ]);
  });
});

describe('parseTitle', () => {
  it('handles simple cases', () => {
    expect(parseTitle('New York Times, Tuesday, April 26, 2022')).toEqual({
      title: 'The Daily Crossword',
      date: new Date('4/26/2022'),
      dayOfWeek: 'Tuesday',
      monthDayYear: 'April 26, 2022',
    });
  });
})
