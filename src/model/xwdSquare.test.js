import XwdSquare from "./xwdSquare";

it("has a solution and a guess", () => {
  const sq = new XwdSquare();
  expect(sq.solution).toBeDefined();
  expect(sq.guess).toBeDefined();
});
