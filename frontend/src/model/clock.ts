import { EventEmitter } from 'events';

export default class Clock extends EventEmitter {
  isRunning: boolean;
  private startTime: number;
  private pauses: number;
  private pauseStarted: number;

  constructor(time = 0) {
    super();
    this.isRunning = false;
    this.startTime = 0;
    this.pauses = 0;
    this.pauseStarted = 0;
    this.setTime(time);
  }

  setTime = (time: number) => {
    const now = Date.now();
    this.startTime = now - time;
    this.pauses = 0;
    this.pauseStarted = now;
    this.emit('set', time);
  };

  getTime = (): number => {
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
