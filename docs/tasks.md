# Tasks

This file is the compact English task tracker for public-facing work.

## MVP Strategy

Deliver a usable local-first meal planner before adding advanced features. Each milestone must leave the app runnable on Expo and preserve local data integrity.

## Ordering Criteria

1. User value.
2. Data model dependencies.
3. Risk reduction.
4. Ease of verification.
5. Release/public-readiness impact.

## Status Values

- `TODO`: not started.
- `IN_PROGRESS`: currently being worked on.
- `DONE`: completed and verified enough for its scope.
- `BLOCKED`: blocked with reason.
- `DEFERRED`: intentionally postponed.

## Milestones

| Milestone | Status | Scope | Verification |
| --- | --- | --- | --- |
| MVP-001 | DONE | Expo project setup, TypeScript, base UI, navigation. | App starts locally. |
| MVP-002 | DONE | Ingredients, recipes and meal tags. | Manual Expo Go checks and tests where present. |
| MVP-003 | DONE | Weekly plans, Today view and random generation. | Manual app flow checks. |
| MVP-004 | DONE | Theme, language, accessibility/contrast improvements. | UI checks in light/dark modes. |
| MVP-005 | DONE | CSV import/export and local database reset. | Export/import verified between app bundle and web app. |
| MVP-006 | DONE | Android APK workflow. | APK pipeline produced installable APK. |
| MVP-007 | DONE | Multiple recipes per meal slot. | Manual flow check; APK smoke test required before release tagging if changed. |
| MVP-008 | IN_PROGRESS | Public repository preparation. | English-only documentation prepared; final secret scan pending. |

## Active Tasks

| ID | Status | Priority | Description | Dependencies | Completion Criteria | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-065 | DONE | MUST | Prepare documentation for public repository using English as the single maintained language. | Existing Markdown docs. | Markdown docs are present without `-ITA` duplicates and no links point to removed Italian copies. | File list, reference search and Git status reviewed. |
| TASK-066 | TODO | MUST | Final public-readiness scan for secrets, tokens, generated artifacts and ignored sensitive files. | TASK-065 | No obvious secrets or tracked build artifacts remain. `.gitignore` covers local/private files. | Repo scan commands reviewed. |
| TASK-067 | IN_PROGRESS | SHOULD | Prepare v1.3.0 UI polish and validation release notes. Includes ingredient filtering/order, warning/error colors, recipe ingredient validation, multi-select blur handling, logo/header polish, Today card spacing and Android safe-area improvements. | Recent UI/validation work. | `CHANGELOG.md` documents v1.3.0 changes; README links the changelog; implementation passes automated checks; manual web/mobile review completed before release. | Typecheck passed for current implementation; final visual review and release smoke test pending. |

## Completed Task Groups

| Range | Status | Notes |
| --- | --- | --- |
| TASK-001..TASK-027 | DONE | Initial MVP setup, core data flows and final smoke testing policy. |
| TASK-028..TASK-046 | DONE | Navigation, contrast, scroll, recipe/plan UX and task hygiene improvements. |
| TASK-047..TASK-058 | DONE | Recipe ordering, tag states, plan buttons, language selector, app icons/logo and APK checks. |
| TASK-059 | DONE | APK size analysis; no meaningful safe optimization found for current scope. |
| TASK-060 | DONE | Duplicate component/action analysis. |
| TASK-061 | DONE | APK workflow setup. |
| TASK-062 | DONE | APK workflow validation from branch push. |
| TASK-063 | DONE | CSV import/export format and UI. |
| TASK-064 | DONE | Multiple recipes per meal slot with related DB/CSV/UI impact handled. |

## Final MVP Smoke Test

Keep the release smoke test as a final manual check rather than repeating it in every development task.

Minimum manual APK checks:

- app opens on Android;
- ingredient create/delete works;
- recipe create/edit/delete works;
- plan create/edit/save/delete works;
- multiple recipes can be added to a meal slot;
- Today shows the selected plan for the current weekday;
- theme and language can be changed;
- CSV export and import work;
- database reset works;
- app survives close/reopen with expected data.

## Deferred / Future

| ID | Status | Description |
| --- | --- | --- |
| FUTURE-001 | DEFERRED | Store-release branch/workflow for iOS/App Store and Play Store distribution. |
| FUTURE-002 | DEFERRED | Optional cloud sync/account system. |
| FUTURE-003 | DEFERRED | Nutrition/calorie planning. |
| FUTURE-004 | DEFERRED | Shopping list generation. |

## Update Rules

- Move a task to `DONE` only after its completion criteria and verification are satisfied.
- Mark blockers with the shortest useful reason.
- Update README/workflow/import-export docs when setup, commands, behavior or file formats change.
- Keep security-related work aligned with `docs/security.md`.
