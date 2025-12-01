# Repository Guidelines

## Project Structure & Module Organization
- `src/index.html` loads the React bundle and mounts `#root`; `src/frontend.tsx` wires React strict mode and HMR; `src/App.tsx` is the primary screen container.
- Shared UI primitives live in `src/components/ui` (buttons, cards, form inputs) and should be reused rather than re-implementing styles.
- Utility helpers belong in `src/lib` (e.g., `cn` for class merging); keep new helpers small and typed.
- Global design tokens and Tailwind layer setup are defined in `styles/globals.css`; prefer editing tokens before scattering color values.
- Build tooling sits at the repo root: `build.ts` for production builds, `bunfig.toml` for Bun config, and `components.json` for UI library settings.

## Build, Test, and Development Commands
- `bun install` — install dependencies.
- `bun dev` — serve `src/index.html` with hot reload for local development.
- `bun run build.ts --outdir=dist` — create an optimized production bundle (passes options through to Bun’s builder; run with `--help` to see flags).
- `bun start` — run the production entry (ensure the production entry file aligns with your build output before using).

## Coding Style & Naming Conventions
- Use TypeScript and React functional components; prefer named exports when sharing modules.
- Keep indentation at 2 spaces and favor small, pure functions.
- Compose styles with Tailwind classes; merge conditionals via `cn` from `src/lib/utils.ts`.
- Name components in `PascalCase`, files in `kebab-case.tsx` unless they export a component with the same name, and hooks/utilities in `camelCase`.

## Testing Guidelines
- Add tests alongside code using `*.test.tsx/ts` under `src`; colocate when practical to keep intent visible.
- Prefer React Testing Library for components and Bun’s built-in test runner for utilities; mock as little as possible.
- Aim to cover new branches and edge cases for timers, formatting, and state transitions; document gaps in the PR description.
- Run `bun test` (or `bun test <path>`) before submitting; if a new test command is introduced, document it in this file.

## Commit & Pull Request Guidelines
- Commit messages should be short, imperative, and scoped (e.g., `add interval controls`, `fix tailwind tokens`); group related changes per commit.
- PRs should include: a concise summary, before/after screenshots for UI changes, reproducible steps for reviewers, and links to related issues or tasks.
- Keep diffs focused; if refactoring accompanies a feature, call it out in the PR body and separate commits when feasible.
