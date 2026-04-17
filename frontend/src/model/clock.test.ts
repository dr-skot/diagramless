import Clock from './clock';

describe('Clock', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts at given time', () => {
    const clock = new Clock(5000);
    expect(clock.getTime()).toBe(5000);
  });

  it('starts at 0 by default', () => {
    const clock = new Clock();
    expect(clock.getTime()).toBe(0);
  });

  it('is not running initially', () => {
    const clock = new Clock();
    expect(clock.isRunning).toBe(false);
  });

  it('tracks elapsed time when running', () => {
    const clock = new Clock();
    clock.start();
    jest.advanceTimersByTime(1000);
    expect(clock.getTime()).toBe(1000);
  });

  it('does not advance when stopped', () => {
    const clock = new Clock();
    clock.start();
    jest.advanceTimersByTime(1000);
    clock.stop();
    jest.advanceTimersByTime(5000);
    expect(clock.getTime()).toBe(1000);
  });

  it('resumes from where it stopped', () => {
    const clock = new Clock();
    clock.start();
    jest.advanceTimersByTime(1000);
    clock.stop();
    jest.advanceTimersByTime(5000);
    clock.start();
    jest.advanceTimersByTime(500);
    expect(clock.getTime()).toBe(1500);
  });

  it('toggle starts and stops', () => {
    const clock = new Clock();
    clock.toggle();
    expect(clock.isRunning).toBe(true);
    clock.toggle();
    expect(clock.isRunning).toBe(false);
  });

  it('reset sets time to 0', () => {
    const clock = new Clock(5000);
    clock.reset();
    expect(clock.getTime()).toBe(0);
  });

  it('setTime changes current time', () => {
    const clock = new Clock();
    clock.setTime(3000);
    expect(clock.getTime()).toBe(3000);
  });

  it('emits stop event', () => {
    const clock = new Clock();
    const handler = jest.fn();
    clock.on('stop', handler);
    clock.start();
    clock.stop();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('emits start event', () => {
    const clock = new Clock();
    const handler = jest.fn();
    clock.on('start', handler);
    clock.start();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not emit stop if already stopped', () => {
    const clock = new Clock();
    const handler = jest.fn();
    clock.on('stop', handler);
    clock.stop();
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not emit start if already running', () => {
    const clock = new Clock();
    const handler = jest.fn();
    clock.on('start', handler);
    clock.start();
    clock.start();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
