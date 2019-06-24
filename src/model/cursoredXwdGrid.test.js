import CursoredXwdGrid from "./cursoredXwdGrid";

it("starts at 0, 0 pointing across", () => {
  const grid = new CursoredXwdGrid(5, 5);
  expect(grid.cursor).toEqual([0, 0]);
  expect(grid.direction).toEqual([0, 1]);
});

it("stays in place and changes direction on perpendicular arrow", () => {
  const grid = new CursoredXwdGrid(5, 5);
  grid.handleArrow(1, 0);
  expect(grid.cursor).toEqual([0, 0]);
  expect(grid.direction).toEqual([1, 0]);
});
