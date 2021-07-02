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

  const getClasses = (label: string) => {
    return `HelpMenu-item--1xl0_${checked.includes(label) ? ' HelpMenu-checked--38XRQ' : ''}`;
  };

  return (
    <li className="Tool-button--39W4J Tool-tool--Fiz94 Tool-texty--2w4Br">
      <button onClick={showing ? hide : show}>{title}</button>
      <ul
        className="HelpMenu-menu--1Z_OA"
        style={{ visibility: showing ? 'visible' : 'hidden' }} // TODO do it with className
      >
        {Object.entries(items).map(([label, action]) => (
          <li
            key={['drop-menu', title, label].join(' ')}
            className={getClasses(label)}
            style={{ display: 'list-item', textTransform: 'capitalize' }} // TODO move this to css
          >
            <button onClick={action}>{label}</button>
          </li>
        ))}
      </ul>
    </li>
  );
}
