# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Diagramless is a crossword puzzle solving app. A React/TypeScript frontend fetches puzzles from a Flask backend (which proxies/caches XWordInfo data). Deployed as two Railway services from this monorepo.

## Commands

### Frontend (`frontend/`)
- `npm start` — dev server on port 3000
- `npm test` — run Jest tests
- `npm test -- --testPathPattern=model/grid` — run a single test file
- `npm run build` — production build (no sourcemaps)
- `npm run coverage` — test coverage report

### Backend (`backend/`)
- `python3 xwordinfo_api.py` — start Flask API on port 5001
- `python3 fetch_xwordinfo.py MM/DD/YYYY [output.json]` — fetch puzzle by date

### Full Stack (from repo root)
- `./install.sh` — set up Python venv + npm install
- `./start.sh` — start both frontend and backend locally
- `./deploy.sh` — deploy both services to Railway

## Architecture

### Frontend (`frontend/src/`)

**Model layer** (`model/`) — Pure functional, immutable state transformations. Core types:
- `XwdPuzzle` — top-level puzzle state (grid, cursor, clues, metadata)
- `XwdGrid` — 2D array of `XwdCell`
- `XwdCell` — solution, content, isBlack, isLocked, number, circle, shaded
- `XwdCursor` — row, col, direction

Key pattern: `changeCells(change)(filter)(puzzle)` — curried cell mutations that return new puzzle state.

**Components** (`components/`) — `PuzzleLoader` is the root; owns puzzle state, localStorage persistence, and URL param sync. `Puzzle` handles keyboard/interaction. `PuzzleGrid`/`PuzzleCell` render the board.

**Services** (`services/`):
- `xwordInfoService.ts` — fetches from backend API, transforms XWordInfo JSON → `XwdPuzzle`
- `xwdService.ts` — parses binary `.puz` files (supports rebus, circles, shading)
- `puzzlePdf.ts` — PDF export via jspdf

**State**: React hooks + localStorage (`xword2` key). `ToastContext` for notifications. Puzzle date in URL query params.

### Backend (`backend/`)

Single Flask app (`xwordinfo_api.py`). One route: `GET /api/puzzle?date=MM/DD/YYYY`. Checks local JSON cache (`xwordinfo_YYYY-MM-DD.json`), fetches from XWordInfo API on cache miss.

### Local Dev Environment
- Frontend reads `REACT_APP_BACKEND_HOST` (set to `http://localhost:5001` by `start.sh`)
- Backend reads `ALLOWED_DOMAINS` for CORS
