import React, { useState, useEffect } from 'react';
import Clock from '../model/clock';

function clockString(ms: number) {
  const totalSeconds = Math.floor((ms || 0) / 1000),
    secs = totalSeconds % 60,
    mins = Math.floor(totalSeconds / 60) % 60,
    hrs = Math.floor(totalSeconds / 3600),
    nn = (n: number) => (n < 10 ? '0' : '') + n;
  return [hrs, ...[mins, secs].map(nn)].join(':');
}

interface PuzzleClockProps {
  clock: Clock;
  disabled: boolean;
}

export default function PuzzleClock({ clock, disabled }: PuzzleClockProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => setTime(clock.getTime()), 250);
    return () => clearInterval(intervalId);
  }, [clock]);

  return (
    <li className="Timer-button Tool-tool">
      <button onClick={clock.toggle} disabled={disabled}>
        <div className="timer-count">{clockString(time)}</div>
        {clock.isRunning && <i className="Icon-pause Icon-icon" />}
      </button>
    </li>
  );
}
