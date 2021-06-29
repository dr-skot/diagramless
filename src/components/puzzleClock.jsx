import React, { useState, useEffect } from "react";

function clockString(ms) {
  const totalSeconds = Math.floor(ms / 1000),
    secs = totalSeconds % 60,
    mins = Math.floor(totalSeconds / 60) % 60,
    hrs = Math.floor(totalSeconds / 3600),
    nn = n => (n < 10 ? "0" : "") + n;
  return [hrs, ...[mins, secs].map(nn)].join(":");
}

export default function PuzzleClock({ clock, disabled }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => setTime(clock.getTime()), 250);
    return () => clearInterval(intervalId);
  }, [clock]);

  return (
      <li className="Timer-button--Jg5pv Tool-tool--Fiz94">
        <button onClick={clock.toggle} disabled={disabled}>
          <div className="timer-count">{ clockString(time) }</div>
          { clock.isRunning && <i className="Icon-pause--1dqCf Icon-icon--1RAWC" /> }
        </button>
      </li>
    );
}
