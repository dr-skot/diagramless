import React, { useCallback, useState } from 'react';

interface DropMenuProps {
  title: string;
  items: Record<string, () => void>;
  checked: string[];
}

export default function DropMenu({ title, items, checked }: DropMenuProps) {
  const [showing, setShowing] = useState(false);

  const hide = useCallback(function clickListener() {
    document.removeEventListener('click', clickListener);
    setShowing(false);
  }, []);

  const show = () => {
    document.addEventListener('click', hide);
    setShowing(true);
  };

  return (
    <li className="Tool-button Tool-tool Tool-texty">
      <button onClick={showing ? hide : show}>{title}</button>
      <ul className={`HelpMenu-menu${showing ? ' visible' : ''}`}>
        {Object.entries(items).map(([label, action]) => (
          <li
            key={['drop-menu', title, label].join(' ')}
            className={`HelpMenu-item${checked.includes(label) ? ' HelpMenu-checked' : ''}`}
          >
            <button onClick={action}>{label}</button>
          </li>
        ))}
      </ul>
    </li>
  );
}
