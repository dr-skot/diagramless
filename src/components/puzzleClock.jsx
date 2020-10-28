import React, { Component } from "react";

class PuzzleClock extends Component {
  state = {
    time: 0,
  };
  timer = 0;

  componentDidMount() {
    const { clock } = this.props;
    clock.on('start', this.startTimer);
    clock.on('stop', this.stopTimer);
    clock.on('set', this.update);
    this.update();
    if (clock.isRunning) this.startTimer();
  }

  componentWillUnmount() {
    const { clock } = this.props;
    clock.off('stop', this.stopTimer);
    clock.off('start', this.startTimer);
    clock.off('set', this.update);
  }

  update = () => this.setState({ time: this.props.clock.getTime() });

  startTimer = () => {
    this.timer = setInterval(this.update, 1000);
    this.update();
  };

  stopTimer = (disable = true) => {
    clearInterval(this.timer);
    this.update();
  };

  toggleTimer = () => {
    (this.state.isRunning ? this.stopTimer : this.startTimer)();
  };

  clockString = (ms) => {
    const totalSeconds = Math.floor(ms / 1000),
      secs = totalSeconds % 60,
      mins = Math.floor(totalSeconds / 60) % 60,
      hrs = Math.floor(totalSeconds / 3600),
      nn = n => (n < 10 ? "0" : "") + n;
    return [hrs, ...[mins, secs].map(nn)].join(":");
  };

  render() {
    const { clock } = this.props;
    return (
      <li className="Timer-button--Jg5pv Tool-tool--Fiz94">
        <button onClick={clock.toggle} disabled={this.props.disabled}>
          <div className="timer-count">{ this.clockString(this.state.time) }</div>
          { clock.isRunning && <i className="Icon-pause--1dqCf Icon-icon--1RAWC" /> }
        </button>
      </li>
    );
  }
}

export default PuzzleClock;
