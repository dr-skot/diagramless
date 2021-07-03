import React, { useEffect, useRef } from 'react';
import { fitTo } from '../services/common/utils';

interface RebusInputProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  alignWith: React.RefObject<HTMLDivElement>;
  onFinish: (submit: boolean) => void;
}

// TODO resize rebus to fit value
// TODO resize input instead of container div

export function RebusInput({ value, setValue, alignWith, onFinish }: RebusInputProps) {
  const element = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!event.key.match(/^(Esc|Enter)/)) return;
    event.preventDefault();
    onFinish(event.key === 'Enter');
  }

  useEffect(() => {
    const fitToCell = () => fitTo(alignWith.current, element.current);
    fitToCell();
    window.addEventListener('resize', fitToCell);
    return () => window.removeEventListener('resize', fitToCell);
  }, [alignWith]);

  return (
    <div id="rebus" ref={element}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
        autoFocus={true}
      />
    </div>
  );
}
