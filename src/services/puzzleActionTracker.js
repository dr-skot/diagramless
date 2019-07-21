// TODO use mobx for undo? or use this?
// TODO group actions

export const CHANGE_CURSOR = "CHANGE_CURSOR",
  CHANGE_DIRECTION = "CHANGE_DIRECTION",
  CHANGE_BLACK = "CHANGE_BLACK",
  CHANGE_CONTENT = "CHANGE_CONTENT",
  CHANGE_NUMBER = "CHANGE_NUMBER";

class PuzzleActionTracker {
  actionStack = [];

  constructor(puzzle) {
    this.puzzle = puzzle;
  }

  valueFor = actionType =>
    actionType === CHANGE_CURSOR
      ? { ...this.puzzle.grid.cursor }
      : actionType === CHANGE_DIRECTION
      ? [...this.puzzle.grid.direction]
      : { ...this.puzzle.grid.currentCell };

  recordAction(actionType, action) {
    const oldValue = this.valueFor(actionType);
    action();
    const newValue = this.valueFor(actionType);
    this.actionStack.unshift({ name: actionType, oldValue, newValue });
  }

  get lastAction() {
    return this.actionStack[0] || {};
  }

  setCursor(row, col) {
    this.recordAction(CHANGE_CURSOR, () => {
      this.puzzle.grid.setCursor(row, col);
    });
  }

  setDirection(direction) {
    this.recordAction(CHANGE_DIRECTION, () => {
      this.puzzle.grid.direction = direction;
    });
  }

  setBlack(value) {
    this.recordAction(CHANGE_BLACK, () => {
      this.puzzle.grid.currentCell.isBlack = value;
    });
  }

  setContent(value) {
    this.recordAction(CHANGE_CONTENT, () => {
      this.puzzle.grid.currentCell.setContent(value);
    });
  }

  setNumber(value) {
    this.recordAction(CHANGE_NUMBER, () => {
      this.puzzle.grid.currentCell.number = value;
    });
  }
}

export default PuzzleActionTracker;
