export interface XWordInfoPuzzle {
  title: string;
  author: string;
  editor: string;
  copyright: string;
  publisher: string;
  date: string;
  notepad: string;
  size: {
    rows: number;
    cols: number;
  };
  grid: string[];
  gridnums: number[];
  circles?: number[];
  clues: {
    across: string[];
    down: string[];
  };
  answers: {
    across: string[];
    down: string[];
  };
}

export const puzzleFromXWordInfo = (xwordInfoData: XWordInfoPuzzle) => {
  if (!xwordInfoData) return null;

  const solution = xwordInfoData.grid;
  const guesses = Array(solution.length).fill('-');

  const clues: { number: string; direction: [number, number]; clue: string }[] = [];

  xwordInfoData.clues.across.forEach((clueText) => {
    const match = clueText.match(/^(\d+)\.\s+(.+)$/);
    if (match) {
      const [, number, text] = match;
      clues.push({ number, direction: [0, 1], clue: text });
    }
  });

  xwordInfoData.clues.down.forEach((clueText) => {
    const match = clueText.match(/^(\d+)\.\s+(.+)$/);
    if (match) {
      const [, number, text] = match;
      clues.push({ number, direction: [1, 0], clue: text });
    }
  });

  return {
    date: xwordInfoData.date,
    label: 'XWordInfo',
    width: xwordInfoData.size.cols,
    height: xwordInfoData.size.rows,
    solution,
    guesses,
    clues,
    numbers: xwordInfoData.gridnums,
    author: xwordInfoData.editor
      ? `${xwordInfoData.author} / ${xwordInfoData.editor}`
      : xwordInfoData.author,
    title: xwordInfoData.title,
    copyright: xwordInfoData.copyright,
    note: xwordInfoData.notepad || '',
    extras: {
      GEXT: xwordInfoData.circles
        ? solution.map((_, i) => (xwordInfoData.circles![i] === 1 ? 0x80 : 0))
        : [],
      shaded: xwordInfoData.circles
        ? solution.map((_, i) => xwordInfoData.circles![i] === 2)
        : [],
    },
  };
};
