import React, { Component } from "react";

class PuzzleClock extends Component {
  state = {
    time: 0,
    startTime: 0,
    isRunning: false
  };

  componentDidMount() {
    const { clock } = this.props;
    Object.assign(clock, {
      start: this.startTimer,
      stop: this.stopTimer,
      reset: this.resetTimer
    });
    if (clock.isRunning) {
      this.startTimer();
    } else {
      this.setState(clock);
    }
  }

  startTimer = () => {
    const clock = this.props.clock;
    clock.startTime = Date.now() - clock.time;
    clock.isRunning = true;
    this.setState(clock);
    this.timer = setInterval(this.tick, 1000);
  };

  stopTimer = () => {
    clearInterval(this.timer);
    const clock = this.props.clock;
    clock.time = Date.now() - clock.startTime;
    clock.isRunning = false;
    this.setState(clock);
    this.props.onClockPause(clock);
  };

  resetTimer = () => {
    Object.assign(this.props.clock, {
      startTime: Date.now(),
      time: 0
    });
    this.setState(this.props.clock);
  };

  toggleTimer = () => {
    (this.state.isRunning ? this.stopTimer : this.startTimer)();
  };

  tick = () => {
    const clock = this.props.clock;
    clock.time = Date.now() - clock.startTime;
    this.setState(clock);
  };

  clockString = ms => {
    const totalSeconds = Math.floor(ms / 1000),
      secs = totalSeconds % 60,
      mins = Math.floor(totalSeconds / 60) % 60,
      hrs = Math.floor(totalSeconds / 3600),
      nn = n => (n < 10 ? "0" : "") + n;
    return [hrs, ...[mins, secs].map(nn)].join(":");
  };

  render() {
    return (
      <li className="Timer-button--Jg5pv Tool-tool--Fiz94">
        <button onClick={this.toggleTimer}>
          <div className="timer-count">{this.clockString(this.state.time)}</div>
          <i className="Icon-pause--1dqCf Icon-icon--1RAWC" />
        </button>
      </li>
    );
  }
}

export default PuzzleClock;
