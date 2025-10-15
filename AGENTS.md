# Repository Guidelines

## Project Structure & Module Organization
The monorepo follows the scaffold shown in `PRD.md`. Place service code under `backend/`, with Express routing in `routes/`, shared data access in `models/`, and generated artifacts (uploads, exports) kept inside their dedicated subfolders. The Vite frontend resides in `frontend/src`, with screen-level components in `pages/` and shared UI in `components/`. Keep infrastructure touchpoints such as `nginx.conf` and deployment scripts at the repository root to simplify server automation.

## Build, Test, and Development Commands
Install dependencies per package before running anything: `npm install` from both `backend/` and `frontend/`. Use `npm run dev` in `frontend/` for the Vite dev server and `npm run dev` in `backend/` (nodemon) for the API. Execute `npm run build` within each package to produce production bundles. Spot-check reporting scripts with `npm run export:excel` and `npm run export:pdf` inside `backend/`.

## Coding Style & Naming Conventions
Adopt 2-space indentation for JavaScript/TypeScript and JSX. Run `npm run lint` in both workspaces before committing; lint uses the airbnb-base + React presets with Prettier integration. Favor PascalCase for components (`ProductTable.jsx`), camelCase for variables and functions, and snake_case for MySQL column names that match the schema in `PRD.md`. Store uploaded files using kebab-case filenames to avoid case-sensitive collisions. Keep QR codes named `qr-<ISO_DATE>-<id>.png` to match the documented pattern.

## Testing Guidelines
Back-end services use Jest with `supertest`; write API specs under `backend/tests/` and name files `<route>.spec.js`. Front-end components rely on Vitest + React Testing Library under `frontend/src/__tests__/`, mirroring directory structure. Guard against regressions by covering CRUD flows, export endpoints, and QR generation helpers. Target 80% branch coverage; check locally with `npm run test -- --coverage` from each workspace.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) and keep subjects under 72 characters. Reference issue IDs in the footer (`Refs #123`) when applicable. Each PR should describe scope, include testing notes (`npm run test`, manual checks), and attach screenshots or GIFs for UI-facing changes. Call out config changes (.env samples, Nginx rules, PM2 scripts) so reviewers can replicate them quickly.

## Environment & Deployment Notes
Store secrets in `.env` files that mirror `.env.example`. PM2 ecosystem configs should read from environment variables rather than hard-coded paths. When updating `nginx.conf`, note upstream ports and TLS requirements so ops can mirror the LAN deployment.
