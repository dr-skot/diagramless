const EventEmitter = require('events');

class Clock extends EventEmitter {
  constructor(time = 0) {
    super();
    this.setTime(time);
    this.isRunning = false;
  }

  setTime = (time) => {
    const now = Date.now();
    this.startTime = now - time;
    this.pauses = 0;
    this.pauseStarted = now; // ignored if isRunning
    this.emit('set', time);
  };

  getTime = () => {
    const now = Date.now();
    const currentPause = this.isRunning ? 0 : now - this.pauseStarted;
    return now - this.startTime - this.pauses - currentPause;
  };

  start = () => {
    if (this.isRunning) return;
    this.pauses += Date.now() - this.pauseStarted;
    this.isRunning = true;
    this.emit('start');
  };

  stop = () => {
    if (!this.isRunning) return;
    this.pauseStarted = Date.now();
    this.isRunning = false;
    this.emit('stop');
  };

  toggle = () => (this.isRunning ? this.stop : this.start)();

  reset = () => {
    this.setTime(0);
  };
}

export default Clock;
