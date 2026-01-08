# Lab Seat Management - Copilot Instructions

## 🏗 Project Architecture

- **Framework**: React 19 + TypeScript + Vite 7
- **Styling**: Tailwind CSS 3.4
- **State Management**:
  - Centralized state in `src/App.tsx` (users, seat assignments).
  - Persistence via `localStorage` keys: `lab-users-data`, `lab-seat-data`.
- **Data Handling**:
  - **Domain Models**: Defined centrally in `src/types.ts` (`User`, `SeatData`, `UserCategory`).
  - **Static Data**: Train timetables are loaded from CSVs in `src/data/` using Vite's `?raw` import suffix (e.g., `import csv from './file.csv?raw'`).
  - **Parsing**: `src/utils/csvParser.ts` handles raw CSV string to object conversion.

## 🧱 Key Components

- **`App.tsx`**: The main controller. Initializes layouts, handles modal visibility, and orchestrates user/seat logic.
- **`TrainInfo.tsx`**: Integrates `japanese-holidays` to display train schedules relative to "now" + `WALK_MINUTES`.
- **`Seat.tsx`**: Presentational component for individual seats.

## 🛠 Developer Workflows

- **Start Dev Server**: `npm run dev` (Vite)
- **Linting**: `npm run lint` (ESLint 9 + TypeScript-ESLint)
- **Build**: `npm run build` (TSC -> Vite Build)

## 🧩 Conventions & Patterns

### Data Persistence

- Always synchronize state with `localStorage` inside `useEffect` hooks in `App.tsx`.
- Fallback to `DEFAULT_USERS` or `DEFAULT_SEATS` if parsing fails.

### Train Timetable Logic

- Timetables are static CSVs (`weekend.csv`, `holiday.csv`).
- **Logic**:
  - Determine schedule type (Weekday vs Holiday/Weekend) using `japanese-holidays`.
  - Filter next trains based on: `Current Time + 15 min walk`.

### CSV Import

- **Do NOT** use `fs` or backend file reading.
- Import CSVs as raw strings:
  ```typescript
  import data from "../data/file.csv?raw";
  const parsed = parseCSV(data);
  ```

### Styling

- Use **Tailwind CSS** utility classes directly in JSX.
- For dynamic styles (e.g., seat occupied/empty), use template literals with conditional logic:
  ```tsx
  className={`${baseStyle} ${isActive ? "bg-blue-500" : "bg-gray-200"}`}
  ```

## 🚨 Integration Points

- **Japanese Holidays**: `japanese-holidays` library is used to determine schedule types.
- **Assets**: Raw CSV files in `src/data/` must adhere to the format `Hour,Minute,Destination` (ignoring `#` comments).
