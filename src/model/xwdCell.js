import { observable, decorate } from "mobx";

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
    return this.blackIsCorrect() && (this.isBlack || this.contentIsCorrect());
  }

  blackIsCorrect() {
    return this.isBlack === this.solution.isBlack;
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
}

decorate(XwdCell, {
  isBlack: observable,
  content: observable,
  number: observable,
  isVerified: observable,
  isMarkedWrong: observable,
  wasRevealed: observable
});

export default XwdCell;
