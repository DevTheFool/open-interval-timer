# Repository Guidelines

## Project Structure & Module Organization
- Entry: `src/index.html` → `src/frontend.tsx`; `src/App.tsx` switches between setup, running view, workout editor, and exercise editor screens.
- Components: `src/components` (TimerSetup, RunningView, WorkoutEditor, ExerciseEditor, WorkoutCalendar) with shared primitives in `src/components/ui`.
- Hooks: `useHiitTimer` (phase machine, TTS, skip/back/pause), `useWorkoutLibrary` (routine CRUD in localStorage), `useWorkoutHistory` (completion log). Data types live in `src/types.ts`.
- Utilities stay in `src/lib/utils.ts` (`cn`, `formatSeconds`, `clamp`, `speak`, ID/duration helpers). Keep new helpers here unless feature-specific.
- Styling via Tailwind in `styles/globals.css` (dark theme tokens, animations). Adjust tokens instead of hard-coding colors. Build tooling sits in `build.ts`, `bunfig.toml`, `components.json`.

## Build, Test, and Development Commands
- `bun install` — install dependencies.
- `bun dev` — hot-reload local dev server.
- `bun run build` — production bundle into `dist/` (runs `build.ts`).
- `bun start` — serve the production entry; sanity-check after builds.

## Coding Style & Naming Conventions
- TypeScript + React function components; prefer small, focused hooks and pass explicit props.
- 2-space indentation; Tailwind-first styling, conditionals merged with `cn`.
- Components in `PascalCase`, hooks in `camelCase`, files in `kebab-case`. Keep workout/timer utilities typed and reusable.
- Keep browser-only behaviors (speech synthesis, history navigation) guarded with runtime checks.

## Testing Guidelines
- Add tests under `src` (e.g., `*.test.tsx/ts`). Favor RTL for UI, Bun test runner for utilities/hooks.
- Cover timer transitions (prepare/work/rest/done), skip/back rules, pause/resume, routine sequencing, localStorage persistence, and speech gating when APIs are absent.
- Run `bun test` (or scoped paths) before submitting; note any flaky or untested areas in the PR.

## Commit & Pull Request Guidelines
- Commit messages: short/imperative (e.g., `add routine editor`, `fix skip logic`); keep unrelated changes separate.
- PRs: summarize behavior change, include screenshots for UI shifts, list verification steps, and link issues/tasks.
- Flag browser-specific behaviors (TTS, history pop handling) for reviewers; clarify whether totals include prep time when relevant.
