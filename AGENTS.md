# Repository Guidelines

## Project Structure & Module Organization
- Entry: `src/index.html` loads `src/frontend.tsx`, which mounts `App.tsx` (setup, running timer, workout editor, exercise editor screens).
- Components: `src/components` (TimerSetup, RunningView, WorkoutEditor, ExerciseEditor, WorkoutCalendar) plus shadcn primitives in `src/components/ui`; WorkoutEditor handles drag-and-drop ordering.
- Hooks: `useHiitTimer` (prep/work/rest builder, TTS countdown, pause/skip/back), `useWorkoutLibrary` (localStorage CRUD + reorder), `useWorkoutHistory` (completion log). Types live in `src/types.ts`.
- Utilities live in `src/lib/utils.ts` (`cn`, `formatSeconds`, `clamp`, `speak`, ID/duration helpers). Tailwind theme in `styles/globals.css`; app rules in `src/index.css`.

## Build, Test, and Development Commands
- `bun install` — install dependencies.
- `bun dev` — hot-reload dev server.
- `bun run build` — production bundle into `dist/` via `build.ts`.
- `bun start` — serve the production entry from `dist`.
- `bun test` — run Bun’s test runner when tests are added (`*.test.ts[x]`).

## Coding Style & Naming Conventions
- TypeScript + React; keep props explicit and state localized. Favor helpers in hooks/utils over inline logic.
- Tailwind-first styling; merge conditional classes with `cn` and stick to theme tokens for the dark palette instead of hard-coded colors.
- Components in `PascalCase`, hooks in `camelCase`, files in `kebab-case`. Keep timers/workouts typed in `types.ts`.
- Avoid nested interactive elements (previous hydration bug); guard browser-only APIs (`speechSynthesis`, `history`) with `typeof window !== "undefined"`.

## Testing Guidelines
- Add tests under `src` (e.g., `*.test.tsx/ts`). Favor RTL for UI and Bun’s test runner for hooks/utils.
- Cover phase sequencing (prep → work/rest → done), pause/resume, skip/back edge cases, drag-drop persistence, workout creation rules (cannot start empty), and history logging.
- Use fake timers for countdown logic and assert speech calls only when APIs exist.

## Commit & Pull Request Guidelines
- Commit messages: short/imperative (e.g., `add drag reorder`, `fix tts countdown`) and scoped to one concern.
- PRs: summarize behavior changes, include screenshots/GIFs for UI shifts, list verification steps (dev run, build, key flows), and link issues/tasks.
- Call out browser-only behaviors (TTS, history pop handling) or accessibility risks. Note whether durations include the 10s prep.

## Behavior & Persistence Notes
- Workouts persist in `localStorage` under `hiit-workouts`; completion dates under `workout-history`.
- Timer prep is fixed at 10s; total time badges include prep. Starting a routine is disabled without exercises; deleting the final exercise should remove the empty workout.
- Use `reorderExercises` for drag/drop updates instead of mutating arrays in-place to keep storage and UI in sync.
