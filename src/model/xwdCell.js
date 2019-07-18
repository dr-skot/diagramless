import { observable, decorate, action } from "mobx";

class XwdCell {
  isBlack = false;
  content = "";
  number = null;
  isVerified = false;
  isMarkedWrong = false;
  wasRevealed = false;
  solution = {};

  setContent(content) {
    this.content = content;
    this.isMarkedWrong = false;
  }

  toggleBlack() {
    this.isBlack = !this.isBlack;
  }

  // Checking and revealing

  isCorrect() {
    // ignore content is ignored if cell is black
    return this.solution.isBlack
      ? this.isBlack
      : !this.isBlack && this.contentIsCorrect();
  }

  blackIsCorrect() {
    // test equal truthiness rather than equality
    return !!this.isBlack === !!this.solution.isBlack;
  }

  contentIsCorrect() {
    return this.content === this.solution.content;
  }

  check() {
    if (!this.isBlack && !this.content) return; // don't check empty cells
    const correct = this.isCorrect();
    this.isVerified = correct;
    this.isMarkedWrong = !correct;
  }

  reveal() {
    const correct = this.isCorrect();
    if (!correct) {
      this.isBlack = this.solution.isBlack;
      this.setContent(this.solution.content);
    }
    this.isVerified = correct;
    this.wasRevealed = !correct;
  }

  exposeNumber() {
    this.number = this.solution.number;
  }
}

decorate(XwdCell, {
  isBlack: observable,
  content: observable,
  number: observable,
  isVerified: observable,
  isMarkedWrong: observable,
  wasRevealed: observable,
  setContent: action,
  toggleBlack: action,
  check: action,
  reveal: action,
  exposeNumber: action
});

export default XwdCell;
