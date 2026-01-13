# Lab Seat Management – Copilot Instructions

## Stack & Entry Points

- React 19 + TypeScript + Vite 7; Tailwind utility classes in JSX (no CSS modules). Dev server `npm run dev`.
- Main controller: [src/App.tsx](src/App.tsx). Centralizes seat layout, modal toggles, and delegates stay tracking to `useStayTracking`.
- Domain types live in [src/types.ts](src/types.ts) (`User`, `SeatState`, `StaySession`, `UserCategory`). Keep new data aligned there.

## State, Persistence, and Layout

- Seat grid defined in `INITIAL_LAYOUT` in [src/App.tsx](src/App.tsx); empty-state factory `createEmptySeatStates` ensures all seats exist.
- LocalStorage keys: `lab-users-data`, `lab-seat-data` for current occupants; `lab-stay-sessions` plus `lab-last-reset-date` for history. Use `normalizeSeatStates` to tolerate legacy shapes.
- Default members `DEFAULT_USERS` seed the app when storage is empty; categories are `Staff|D|M|B|Other`.
- Seat actions: select empty seat → `UserSelectModal`; occupied seat → `ActionModal` (toggle away/present or leave). Random assignment via `RandomSeatModal` → `assignRandomSeatForUser` updates both seat state and stay session.

## Stay Tracking & Leaderboard

- `useStayTracking` ([src/hooks/useStayTracking.ts](src/hooks/useStayTracking.ts)) owns sessions and weekly totals. Sessions store `start/end` per seat/user; weekly buckets start Monday (Sun handled as previous week).
- Daily cleanup runs after 06:00 to clear seats; week changes close open sessions and reopen them for the new week. `startSession/endSession` must be called alongside seat state changes to keep stats accurate.
- Leaderboard modal consumes `leaderboardRows`, `selectedWeekLabel`, and navigation guards (`disablePrev/Next/ThisWeek`).

## Train Info & Data Loading

- Train times stored as CSV in [src/data](src/data) and imported with `?raw`; parse with `parseCSV` ([src/utils/csvParser.ts](src/utils/csvParser.ts)). Only destinations `谷上` or `新神戸` are accepted; lines starting with `#` ignored.
- [src/components/TrainInfo.tsx](src/components/TrainInfo.tsx) picks weekday vs holiday/weekend using `japanese-holidays`; shows next 3 departures after adding a 10-minute walk.

## UI Components

- Seats: [src/components/Seat.tsx](src/components/Seat.tsx) color-codes empty/away/present; click bubbles `seatId` to parent.
- Modals: `UserSelectModal` and `RandomSeatModal` group users by category and display stay time summaries. `AdminModal` manages members and edits recent 50 stay sessions (validates start/end order, uses local timezone inputs). `NewsVideo` embeds NHK YouTube muted.

## Workflows

- Lint `npm run lint`; unit tests `npm test` / `npm run test:watch` (Vitest, jsdom, React Testing Library); e2e `npm run test:e2e` (Playwright, specs in `e2e/`). Build `npm run build`; preview `npm run preview`.
- Avoid using `fs`/server APIs; Vite handles static CSVs via raw imports.

## Patterns & Gotchas

- When modifying seat actions, always sync both `seatStates` and stay sessions to avoid skewed leaderboard totals.
- Resets: `handleReset` clears seats after confirming and closes open sessions; week/day transitions happen in `useStayTracking` interval.
- Keep Tailwind class strings readable; prefer template literals for dynamic states (away/present, selection highlighting).
- CSV additions must follow `Hour,Minute,Destination` format; otherwise `parseCSV` drops lines silently.
