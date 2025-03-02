import React, { useState, useEffect, useRef } from 'react';

interface DropMenuProps {
  title: string;
  items: Record<string, () => void>;
  checked: string[];
}

export default function DropMenu({ title, items, checked }: DropMenuProps) {
  const [showing, setShowing] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showing) return;

    const handleClickOutside = (event: MouseEvent) => {
      // If the click is on the button, let the button's onClick handle it
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }
      
      // If the click is outside the menu, close it
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowing(false);
      }
    };

    // Add the listener on the next tick to avoid the current click event
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showing]);

  const toggleMenu = () => {
    setShowing(!showing);
  };

  return (
    <li className="Tool-button Tool-tool Tool-texty">
      <button ref={buttonRef} onClick={toggleMenu}>{title}</button>
      <ul ref={menuRef} className={`HelpMenu-menu${showing ? ' visible' : ''}`}>
        {Object.entries(items).map(([label, action]) => (
          <li
            key={['drop-menu', title, label].join(' ')}
            className={`HelpMenu-item${checked.includes(label) ? ' HelpMenu-checked' : ''}`}
          >
            <button onClick={() => {
              action();
              // Close the menu after selecting an item
              setShowing(false);
            }}>{label}</button>
          </li>
        ))}
      </ul>
    </li>
  );
}
