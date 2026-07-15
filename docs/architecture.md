# Architecture

## Overview

EZ-MEAL is a local-first Expo React Native app with shared Android, iOS and web code. The system is organized around a small domain model for ingredients, recipes, weekly plans and preferences.

Main requirement mapping:

- Ingredients and recipes: domain types, repositories and feature screens.
- Weekly plans and Today view: plan domain rules plus UI state.
- CSV import/export: parser/serializer and validation layer.
- Theme/language: shared preferences and UI providers.

## Technology Stack

| Area | Choice | Rationale |
| --- | --- | --- |
| App runtime | Expo SDK 54 + React Native | Single codebase for Android, iOS and web. |
| Language | TypeScript | Safer domain and UI contracts. |
| Persistence | SQLite/local storage through Expo-compatible APIs | Offline-first local data with structured queries. |
| Testing | Jest + React Native Testing Library where applicable | Unit and UI regression coverage for core flows. |
| Build | Expo/EAS | Android APK workflow and future store builds. |

No backend, external API or cloud database is part of the MVP.

## Application Architecture

Layers:

- `src/domain/`: pure types, constants and business rules.
- `src/data/`: persistence, migrations, repositories, import/export mapping.
- `src/features/`: screens, local feature state and user flows.
- `src/shared/`: theme, i18n, reusable UI components, logging and utilities.
- `assets/`: logo, icons and static assets.
- `docs/`: product, technical and operational documentation.

Allowed dependencies:

- features may depend on domain, data and shared;
- data may depend on domain and shared utilities;
- domain must not depend on UI or persistence;
- shared UI must not own domain behavior.

## Project Structure

```text
App.tsx
index.ts
app.json
src/
  data/
  domain/
  features/
  shared/
  test/
assets/
  logo/
docs/
```

## Main Components

| Component | Responsibility | Related requirements |
| --- | --- | --- |
| Ingredient management | Create/list/delete ingredients. | REQ-001 |
| Recipe management | Create/edit/delete recipes, assign meal tag and ingredients. | REQ-002 |
| Plan management | Create/select/edit/delete weekly plans. | REQ-003 |
| Meal slot editor | Add/remove/swap one or more recipes in a slot. | REQ-004 |
| Random plan generator | Fill compatible slots with random recipes. | REQ-005 |
| Today view | Resolve current weekday and selected plan meals. | REQ-006 |
| CSV import/export | Validate and serialize complete app data. | REQ-007 |
| Settings | Theme, language, reset and import/export entry points. | REQ-008 |

## Data Model

Core entities:

- `Ingredient`: id, name, timestamps.
- `Recipe`: id, name, meal tag, ingredient ids, timestamps.
- `MealPlan`: id, title, days, timestamps.
- `PlanDay`: weekday, breakfast/lunch/dinner slots.
- `MealSlot`: meal tag, ordered recipe ids.
- `Preferences`: theme, language, selected plan id.

Relationships:

- recipe references many ingredients;
- plan slots reference many recipes;
- Today view resolves selected plan plus current weekday.

## Main Flows

Recipe creation:

```text
UI input -> validation -> repository save -> app state refresh -> visible recipe card
```

Plan editing:

```text
select plan -> enter edit mode -> mutate draft -> validate meal-tag compatibility -> save -> persist plan
```

CSV import:

```text
select CSV -> read file -> parse rows -> validate references/preferences -> replace/import data transactionally -> refresh app state
```

## Error Handling and Logging

- User-facing errors must be short, actionable and localized.
- Recoverable failures should not crash the app.
- Log meaningful operation boundaries such as import/export, reset and persistence failures.
- Do not log secrets, private file contents or full user datasets.
- Use correlation/request identifiers only if future multi-step asynchronous flows require them.

## Configuration

Configuration lives in Expo/app config and package scripts. Secrets must not be committed; see `docs/security.md`.

Important release fields:

- `package.json > version`
- `app.json > expo.version`
- `app.json > expo.android.versionCode`
- `app.json > expo.ios.buildNumber`

Use `npm run version:bump -- <version>` to keep them aligned.

## Performance and Scalability

Personal-scale local data is expected. Keep operations simple and synchronous from the user's perspective when possible. CSV import should validate before applying changes to avoid partial corruptions.

## Testing Strategy

- Unit-test domain rules for weekdays, compatible meal tags and data transformations.
- Test repository/import-export logic with representative fixtures.
- Test theme and language behavior where UI regressions are likely.
- Keep APK smoke testing as a final manual verification step for release builds.

## Development Conventions

- Prefer small feature slices that leave the app usable.
- Keep shared UI components consistent for action buttons and chips.
- Avoid duplicating button/action implementations.
- Prefer explicit domain names over comments.
- Update `README.md`, `WORKFLOW.md`, `IMPORT_EXPORT.md` or `docs/tasks.md` when behavior changes.

## Code Documentation Policy

- Comments in code should be in English.
- Add brief documentation to main application classes/modules when useful.
- Comment only non-obvious domain rules, trade-offs or assumptions.
- Avoid comments that restate method, variable or component names.

## Logging Policy

Use logs for diagnostics, not narration. Log significant app events, integrations, import/export stages, reset actions and handled failures. Avoid noisy method entry/exit logs and duplicate temporary logs.

## README Guidance

`README.md` should keep these details current:

- project purpose;
- stack;
- prerequisites;
- setup/start/test/build commands;
- essential configuration without secrets;
- project structure;
- entry points;
- links to `docs/`, `IMPORT_EXPORT.md` and `WORKFLOW.md`.

## Architecture Decisions

Record significant decisions in `docs/decisions.md` when they affect data shape, release workflow, public security posture, import/export format or platform strategy.
