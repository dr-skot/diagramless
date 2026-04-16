import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TextDecoder as NodeTextDecoder } from 'util';
import { puzzleFromFileData } from './puz';

// Polyfill TextDecoder for jsdom test environment
if (typeof globalThis.TextDecoder === 'undefined') {
  (globalThis as any).TextDecoder = NodeTextDecoder;
}
import { puzzleData as expectedPlain } from '../../tests/assets/plain-Jun2521.data';
import { puzzleData as expectedCircles } from '../../tests/assets/circles-Jun2221.data';

const loadPuz = (filename: string) => {
  const buf = readFileSync(resolve(__dirname, '../../tests/assets', filename));
  // Copy into a fresh ArrayBuffer to avoid Node Buffer shared-memory issues
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; i++) view[i] = buf[i];
  return ab;
};

describe('puzzleFromFileData', () => {
  it('parses a plain .puz file', () => {
    const result = puzzleFromFileData(loadPuz('plain-Jun2521.puz'));
    expect(result).toBeDefined();
    expect(result!.width).toBe(expectedPlain.width);
    expect(result!.height).toBe(expectedPlain.height);
    expect(result!.title).toBe(expectedPlain.title);
    expect(result!.author).toBe(expectedPlain.author);
    expect(result!.solution).toEqual(expectedPlain.solution);
  });

  it('parses circles from .puz file', () => {
    const result = puzzleFromFileData(loadPuz('circles-Jun2221.puz'));
    expect(result).toBeDefined();
    expect(result!.width).toBe(expectedCircles.width);
    expect(result!.height).toBe(expectedCircles.height);
    // GEXT should be a Uint8Array with circle bits
    expect(result!.extras.GEXT).toBeDefined();
  });

  it('returns undefined for falsy input', () => {
    expect(puzzleFromFileData(null as any)).toBeUndefined();
  });
});
