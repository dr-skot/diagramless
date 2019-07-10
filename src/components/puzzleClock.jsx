import React, { Component } from "react";

class PuzzleClock extends Component {
  state = {
    time: 0,
    start: 0,
    isRunning: false
  };

  componentDidMount() {
    const { clock } = this.props;
    this.setState(clock);
    if (clock.isRunning) this.startTimer();
  }

  // keeps clock object passed by parent in sync with internal timer
  componentDidUpdate() {
    const { clock } = this.props;
    clock.time = this.state.time;
    clock.isRunning = this.state.isRunning;
  }

  startTimer = () => {
    this.setState({
      start: Date.now() - this.state.time,
      isRunning: true
    });
    this.timer = setInterval(this.tick, 1000);
  };

  stopTimer = () => {
    clearInterval(this.timer);
    this.setState({
      time: Date.now() - this.state.start,
      isRunning: false
    });
  };

  toggleTimer = () => {
    (this.state.isRunning ? this.stopTimer : this.startTimer)();
  };

  tick = () => {
    this.setState({
      time: Date.now() - this.state.start
    });
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
        </button>
      </li>
    );
  }
}

export default PuzzleClock;
