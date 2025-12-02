# Repository Guidelines

## Project Structure & Module Organization
- `src/index.html` mounts `#root`; `src/frontend.tsx` wires React strict mode and HMR; `src/App.tsx` composes the setup vs running views.
- Feature components live in `src/components` (e.g., `RunningView`, `TimerSetup`, `WorkoutCalendar`); shared UI primitives are in `src/components/ui` (buttons, form inputs). Reuse them instead of duplicating styles.
- Hooks belong under `src/hooks` (`useHiitTimer` for timer logic/TTS/back handling; `useWorkoutHistory` for localStorage-backed history).
- Utilities live in `src/lib/utils.ts` (`cn`, `formatSeconds`, `clamp`, `speak`); keep helpers small and typed.
- Design tokens and Tailwind setup are in `styles/globals.css`; update tokens instead of sprinkling raw colors. Tooling: `build.ts`, `bunfig.toml`, `components.json`.

## Build, Test, and Development Commands
- `bun install` — install dependencies.
- `bun dev` — serve `src/index.html` with hot reload for local development.
- `bun run build.ts --outdir=dist` — production bundle (pass extra flags via CLI; `--help` shows options).
- `bun start` — run the production entry; confirm it matches your build output before relying on it.

## Coding Style & Naming Conventions
- TypeScript + React function components; prefer named exports for shared modules.
- Indentation: 2 spaces; favor small, pure functions and colocated hook/state logic.
- Tailwind-first styling; merge conditionals with `cn` from `src/lib/utils.ts`. Keep gradients/animations consistent with existing dark theme.
- Components in `PascalCase`, files in `kebab-case.tsx`, hooks/utilities in `camelCase`. Co-locate feature pieces (component + hook) when it improves clarity.

## Testing Guidelines
- Add tests alongside code (`*.test.tsx/ts`) under `src`; keep timer logic and history persistence covered.
- Use React Testing Library for UI, Bun test runner for utilities/hooks; mock speech where needed but avoid over-mocking timers.
- Cover edge cases: prep phase flow, pause/skip/back rules, history write/read, TTS gating when browser APIs are absent.
- Run `bun test` (or `bun test <path>`) before submitting; document any gaps or flakiness in the PR.

## Commit & Pull Request Guidelines
- Keep messages short and imperative (e.g., `add calendar history`, `tweak work fill animation`); group related changes per commit.
- PRs: concise summary, before/after screenshots for UI shifts, steps to reproduce/verify, and linked issues/tasks.
- Highlight refactors vs features; note browser-only behaviors (TTS, history pop) in the PR description for reviewers.
