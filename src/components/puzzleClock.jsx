import React, { Component } from "react";

class PuzzleClock extends Component {
  state = {
    time: 0,
    start: 0,
    isRunning: false
  };

  componentDidMount() {
    const { clock } = this.props;
    if (clock.isRunning) {
      this.startTimer();
    } else {
      this.setState(clock);
    }
  }

  startTimer = () => {
    const clock = this.props.clock;
    clock.start = Date.now() - clock.time;
    clock.isRunning = true;
    this.setState(clock);
    this.timer = setInterval(this.tick, 1000);
  };

  stopTimer = () => {
    clearInterval(this.timer);
    const clock = this.props.clock;
    clock.time = Date.now() - clock.start;
    clock.isRunning = false;
    this.setState(clock);
  };

  toggleTimer = () => {
    (this.state.isRunning ? this.stopTimer : this.startTimer)();
  };

  tick = () => {
    const clock = this.props.clock;
    clock.time = Date.now() - clock.start;
    this.setState(clock);
  };

  clockString = ms => {
    const seconds = Math.floor(ms / 1000),
      secs = seconds % 60,
      ss = (secs < 10 ? "0" : "") + secs,
      m = "" + Math.floor(secs / 60);
    return m + ":" + ss;
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
