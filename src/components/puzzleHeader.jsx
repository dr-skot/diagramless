import React from "react";
import { capitalize } from "../services/common/utils";
import { observer } from "mobx-react";

const PuzzleHeader = props => {
  // TODO handle other title formats than NY Times
  // do this munging on model so not rerendering every time
  const { title, author } = props,
    [maker, editor] = author.split(" / ").map(name => name.toUpperCase()),
    titlePieces = title.match(/NY Times, (\w+, \w+ \d+, \d+)(.*)/),
    date = new Date(titlePieces[1]),
    dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }),
    monthDayYear = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }),
    actualTitle = titlePieces[2].trim()
      ? '"' + capitalize(titlePieces[2].trim().toLowerCase()) + '"'
      : "The Daily Crossword";

  return (
    <header className="PuzzleHeader-wrapper--3FN32">
      <div className="PuzzleHeader-row--3-nAI">
        <div className="PuzzleHeader-puzzleDetailsContainer--2L2k5">
          <div className="PuzzleDetails-details--1WqAl">
            <div className="PuzzleDetails-date--1HNzj">
              <span>{dayOfWeek}</span> {monthDayYear}
            </div>
            <div className="PuzzleDetails-byline--16J5w">
              {actualTitle}
              <span>By {maker}</span>
              <span>Edited by {editor}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

observer(PuzzleHeader);

export default PuzzleHeader;
