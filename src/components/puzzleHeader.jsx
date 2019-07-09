import React from "react";

const PuzzleHeader = props => {
  const { title, author } = props,
    [maker, editor] = author.split(" / ").map(name => name.toUpperCase()),
    dateString = title
      .split(",")
      .slice(2)
      .join(","),
    date = new Date(dateString),
    dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }),
    monthDayYear = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });

  return (
    <header className="PuzzleHeader-wrapper--3FN32">
      <div className="PuzzleHeader-row--3-nAI">
        <div className="PuzzleHeader-puzzleDetailsContainer--2L2k5">
          <div className="PuzzleDetails-details--1WqAl">
            <div className="PuzzleDetails-date--1HNzj">
              <span>{dayOfWeek}</span> {monthDayYear}
            </div>
            <div className="PuzzleDetails-byline--16J5w">
              The Daily Crossword<span>By {maker}</span>
              <span>Edited by {editor}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PuzzleHeader;
