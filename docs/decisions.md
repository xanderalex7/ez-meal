# Decisions

This file records compact architecture/product decisions that affect future implementation.

## DEC-001: Local-First MVP

- Decision: EZ-MEAL stores app data locally and does not require accounts or backend services.
- Rationale: The core value is personal planning with low setup friction.
- Alternatives: Cloud sync, account-based storage.
- Impact: Import/export is the portability mechanism; no authentication is required for MVP.

## DEC-002: Weekday-Based Planning

- Decision: Meal plans are Monday-Sunday templates. The Today view resolves the current weekday, not an absolute date.
- Rationale: Users want recurring weekly plans such as bulk or deficit plans.
- Alternatives: Calendar-date plans.
- Impact: CSV and persistence store weekdays rather than dated meal entries.

## DEC-003: Multiple Recipes Per Meal Slot

- Decision: Each breakfast/lunch/dinner slot can contain multiple ordered recipes.
- Rationale: Meals can be composed of separate dishes, for example rice, chicken and fruit.
- Alternatives: One recipe per slot.
- Impact: Data model, UI and CSV format must support recipe lists per slot.

## DEC-004: Single CSV Import/Export File

- Decision: Import/export uses one CSV file containing typed rows for preferences, ingredients, recipes and plans.
- Rationale: One file is easier for users and avoids multi-file joins.
- Alternatives: One CSV per entity, XLSX workbook.
- Impact: Validation must check row types and cross-references before applying import.

## DEC-005: Safe Reference Handling on Delete

- Decision: Deleting ingredients or recipes must not leave broken references or crash the app.
- Rationale: Local data integrity is more important than permissive destructive actions.
- Alternatives: Hard cascade delete without confirmation, block all referenced deletes.
- Impact: Delete flows must clean or block references deliberately and consistently.

## DEC-006: Release Version Alignment

- Decision: Package, Expo, Android and iOS versions are bumped through scripts.
- Rationale: EAS displays app version from `app.json`; Git tags alone are not enough.
- Alternatives: Manual edits.
- Impact: Release workflow uses `npm run version:bump`, `npm run version:tag` and `npm run version:tag:push`.

## DEC-007: APK Workflow Branch

- Decision: Pushing to `android-apk` triggers the Android APK EAS workflow.
- Rationale: The APK branch creates installable Android builds without running every main/development push.
- Alternatives: Build on every main push, manual-only builds.
- Impact: Merge to `android-apk` only when an APK build is desired.

## DEC-008: Public Repository Hygiene

- Decision: Generated build outputs, local Expo state and credential-like files are ignored.
- Rationale: The repository is intended to become public.
- Alternatives: Commit local build outputs.
- Impact: Public release requires a final repo scan and history awareness.
