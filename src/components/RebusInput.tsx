import React, { useEffect, useRef, useState } from 'react';
import { offsetRect } from '../utils/dom';

interface RebusInputProps {
  value: React.MutableRefObject<string>;
  alignWith: React.RefObject<HTMLDivElement>;
  onFinish: (submit: boolean) => void;
}

export function RebusInput({ value, alignWith, onFinish }: RebusInputProps) {
  const [, rerender] = useState(Date.now());
  const ref = useRef<HTMLDivElement>(null);

  // place caret at end of new incoming value
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerText = value.current;
    placeCaretAtEnd(ref.current);
  }, [value]);

  // finish on escape or enter
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!event.key.match(/^(Esc|Enter)/)) return;
    event.preventDefault();
    if (event.key === 'Enter') value.current = ref.current?.innerText.toUpperCase() || '';
    onFinish(event.key === 'Enter');
  }

  // rerender on resize to realign with current cell
  useEffect(() => {
    const forceRender = () => rerender(Date.now());
    window.addEventListener('resize', forceRender);
    return () => window.removeEventListener('resize', forceRender);
  }, []);

  return (
    <div
      ref={ref}
      contentEditable
      className="puzzle-cell rebus"
      style={fitTo(alignWith.current)}
      onKeyDown={handleKeyDown}
    ></div>
  );
}

/* utils */

export function fitTo(anchor: HTMLElement | null) {
  if (!anchor) return {};
  const rect = offsetRect(anchor);
  return { ...rect, width: '', minWidth: rect.width, fontSize: anchor.style.fontSize };
}

//stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
function placeCaretAtEnd(node: HTMLElement) {
  node.focus();
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  const sel = window.getSelection();
  sel!.removeAllRanges();
  sel!.addRange(range);
}
