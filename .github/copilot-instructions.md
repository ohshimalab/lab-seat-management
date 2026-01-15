# Lab Seat Management – Copilot Instructions

## Stack & Entrypoints

- React 19 + TypeScript + Vite 7; Tailwind classes in JSX (no CSS files). Dev server `npm run dev`.
- Main controller [src/App.tsx](src/App.tsx) wires layout, modals, seat actions, drag/drop, reminders, telemetry, and delegates tracking to custom hooks.
- Domain types in [src/types.ts](src/types.ts) (`User`, `SeatState`, `StaySession`, `SeatTimelineSlice`, `UserCategory`); align any new data structures here.

## State, Persistence, Import/Export

- Seat grid fixed by `INITIAL_LAYOUT`; `createEmptySeatStates` ensures all seats exist with `userId:null/status:present`. `normalizeSeatStates` tolerates legacy shapes.
- LocalStorage keys: users `lab-users-data`, seats `lab-seat-data`, sessions `lab-stay-sessions`, last reset `lab-last-reset-date`, MQTT config `lab-mqtt-config`.
- `useLabStorage` owns users/seats and provides `makeExportData`/`makeImportHandler`; exports JSON version 2 containing users, seatStates, sessions, lastResetDate, mqttConfig. Import validates categories (`Staff|D|M|B|Other`) and session shapes before mutating state.

## Seat Actions & Dragging

- `useSeatAssignment` handles seat clicks, leave, away toggle, random assignment, greetings. Always pairs seat changes with `startSession/endSession`; `finalizeAllSeats` closes every active session (used in reset).
- `assignRandomSeatForUser` clears previous seats for that user, ends old session, assigns an empty seat, and starts a new session while triggering greetings.
- `useSeatDrag` swaps or moves occupants on drop and calls `endSession/startSession` for both seats to keep history accurate; `startedAt` set to now after any move.

## Stay Tracking & Timers

- `useStayTracking` keeps all stay sessions and weekly totals (week starts Monday; Sunday counts to previous). Timeline buckets are 30 minutes for per-seat day view.
- Reset window 22:30–06:00: first tick in the window closes open sessions, clears seats (`createEmptySeatStates`), and records `lab-last-reset-date` to avoid double reset. Week change closes open sessions and reopens ones matching current seats.
- Leaderboard/labels derive from `leaderboardRows`, `selectedWeekLabel`, and navigation flags (`disablePrevWeek/NextWeek/ThisWeek`); `stayDurationDisplay` shows current-week per-user summaries.

## View & Data Sources

- `useSeatViewModel` builds `seatCards` with user info and today’s timeline overlay and lists `availableUsers` vs occupied ids; keep this in sync when adding seat states.
- Train info uses CSVs in [src/data](src/data) parsed via `parseCSV` ([src/utils/csvParser.ts](src/utils/csvParser.ts)); only `谷上`/`新神戸` destinations accepted, lines starting with `#` skipped. [src/components/TrainInfo.tsx](src/components/TrainInfo.tsx) chooses weekday/holiday via `japanese-holidays` and shows next 3 departures after adding 10-minute walk.
- Environment telemetry via `useEnvTelemetry` (MQTT over ws/wss). Config stored in `lab-mqtt-config`; invalid/empty config clears telemetry. [src/components/EnvInfo.tsx](src/components/EnvInfo.tsx) renders values.

## UI & Modals

- Seats rendered by [src/components/SeatGrid.tsx](src/components/SeatGrid.tsx) + [src/components/Seat.tsx](src/components/Seat.tsx); click/drag bubble seatId to parents.
- [src/components/UserSelectModal.tsx](src/components/UserSelectModal.tsx) groups users by category and shows stay summaries; [src/components/ActionModal.tsx](src/components/ActionModal.tsx) toggles away/leave.
- [src/components/RandomSeatModal.tsx](src/components/RandomSeatModal.tsx) runs random assignment and reports chosen seat; [src/components/LeaderboardModal.tsx](src/components/LeaderboardModal.tsx) navigates weeks.
- [src/components/AdminModal.tsx](src/components/AdminModal.tsx) manages members, edits recent 50 sessions with validation (start<end), handles reminder time/duration, MQTT config, import/export.

## Workflows

- Lint `npm run lint`; unit tests `npm test` / `npm run test:watch` (Vitest + RTL + jsdom); e2e `npm run test:e2e` (Playwright in `e2e/`). Build `npm run build`; preview `npm run preview`.
- Avoid server-side APIs/`fs`; Vite serves static CSVs via `?raw` imports.

## Gotchas

- Always update both `seatStates` and stay sessions when moving/ending seats (click, random, drag, reset) to keep leaderboard/timeline correct.
- Week/day transitions are timer-driven inside `useStayTracking`; avoid separate timers that fight with its interval.
- Keep Tailwind class strings readable (template literals for dynamic states). CSV rows must be `Hour,Minute,Destination` or `parseCSV` will drop them.
