# EZ-MEAL

EZ-MEAL is an offline-first meal planning app for organizing breakfast, lunch and dinner from local recipes and ingredients.

The project is built with Expo and React Native, targets Android, iOS and web, and stores user data locally. Its core goal is to make weekly meal planning quick, calm and portable without requiring accounts, cloud services or external recipe providers.

The initial project workflow was bootstrapped with [emmearn/project-foundry](https://github.com/emmearn/project-foundry).

## What It Does

- Manages ingredients and recipes.
- Assigns recipes to breakfast, lunch or dinner.
- Builds named weekly meal plans from Monday to Sunday.
- Supports multiple recipes in the same meal slot.
- Shows today's meals based on the current weekday.
- Generates editable random meal plan drafts when enough recipes exist.
- Imports and exports all local data through a single CSV file.
- Supports light, dark and system themes.
- Supports Italian and English in the app UI.
- Provides a local database reset from settings.

## Project Status

The app has an advanced MVP with Android APK workflow support.

## Tech Overview

- Expo SDK 54
- React Native
- TypeScript
- Local SQLite persistence
- Jest-based tests
- EAS workflow for Android APK builds

## Repository Map

| Path | Purpose |
| --- | --- |
| `App.tsx` | Root app shell. |
| `index.ts` | Expo entry point. |
| `src/domain/` | Domain types and business rules. |
| `src/data/` | Local persistence, repositories, mappers and migrations. |
| `src/features/` | Feature screens and app model. |
| `src/shared/` | Shared UI, theme, i18n, logging and utilities. |
| `src/test/` | Tests, fixtures and builders. |
| `assets/` | Logo and app icon assets. |
| `docs/` | Requirements, architecture, design, security, decisions and task tracking. |
| `IMPORT_EXPORT.md` | CSV import/export format. |
| `WORKFLOW.md` | Development, release and APK build workflow. |
| `tagging.md` | Version tag policy and commands. |
| `CHANGELOG.md` | Versioned release notes. |

## Documentation

- Product behavior: `docs/requirements.md`
- Technical structure: `docs/architecture.md`
- UI/UX rules: `docs/design.md`
- Security guardrails: `docs/security.md`
- Decisions: `docs/decisions.md`
- Task tracking: `docs/tasks.md`
- CSV format: `IMPORT_EXPORT.md`
- Development/release workflow: `WORKFLOW.md`
- Git tagging: `tagging.md`
- Release notes: `CHANGELOG.md`

## Getting Started

Use Node.js 26.x. Older Node versions can break Metro because Expo SDK 54 depends on newer JavaScript runtime features.

```bash
npm install
npm run start
```

Useful local checks:

```bash
npm run typecheck
npm run test
```

Platform-specific setup, release flow, tagging and APK build steps are documented in:

- `WORKFLOW.md` for the project workflow;
- `tagging.md` for version tags;
- `IMPORT_EXPORT.md` for CSV import/export.
