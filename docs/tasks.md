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
| TASK-067 | IN_PROGRESS | SHOULD | Prepare v1.3.0 UI polish and validation release notes. Includes ingredient filtering/order, recipe filtering, recipe edit scroll behavior, warning/error colors, recipe ingredient validation, multi-select blur handling, logo/header polish, Today card spacing and Android safe-area improvements. | Recent UI/validation work. | `CHANGELOG.md` documents v1.3.0 changes; README links the changelog; implementation passes automated checks; manual web/mobile review completed before release. | Typecheck passed for current implementation; targeted UI tests passed; final visual review and release smoke test pending. |
| TASK-068 | DONE | MUST | Add optional recipe weight/calorie tracking with daily and plan totals. | TASK-064, CSV import/export, local persistence. | Recipes support weight/calorie fields when tracking is enabled; Today and Plan show per-recipe and total calories; Settings exposes measurement unit and tracking toggle; DB and CSV remain backward compatible. | Implementation slices completed with typecheck and full test suite; conceptual weight correction continues in TASK-069. |
| TASK-069 | IN_PROGRESS | MUST | Fix nutrition model: recipe calories stay on the recipe, while quantity moves to each ingredient used in a recipe. | TASK-068 | Recipe ingredient quantities are captured, persisted, imported/exported and displayed correctly; Plan hides quantity values; Today shows recipe calories plus ingredient quantity breakdowns. | Implementation and documentation slices completed with typecheck and targeted tests; manual user testing pending. |

## Detailed Active Task Notes

### TASK-068 - Recipe Weight, Calories, Units and Totals

Goal: add an optional nutrition tracking mode focused on recipe weight and calories, without breaking the existing simple meal-planning flow.

Subtasks:

| ID | Status | Scope | Completion Criteria | Verification |
| --- | --- | --- | --- | --- |
| TASK-068A | DONE | Domain/model foundation. | Recipe nutrition types, default nutrition settings, optional recipe nutrition, validation and derived slot/day/plan totals exist without changing current default behavior. | `npm run typecheck`; domain/app model/persistence/import-export targeted tests passed. |
| TASK-068B | DONE | Persistence and migration. | Local DB supports recipe weight/calories; preferences persist tracking toggle and weight unit; existing local data upgrades without loss; reset restores defaults. | `npm run typecheck`; full Jest suite passed. |
| TASK-068C | DONE | CSV import/export and documentation. | CSV format includes recipe nutrition and nutrition preferences; backward compatibility is handled; invalid numeric/unit data is rejected before import; `IMPORT_EXPORT.md` updated. | `npm run typecheck`; full Jest suite passed. |
| TASK-068D | DONE | Settings and Recipes UI. | Settings exposes tracking toggle and weight unit selection; Recipes create/edit shows and validates weight/calories only when tracking is enabled. | `npm run typecheck`; full Jest suite passed. |
| TASK-068E | DONE | Today and Plan UI totals/layout. | Today and Plan show per-recipe weight/calories, day totals and plan totals when enabled; long recipe names cannot overlap values; missing recipe nutrition shows actionable error. | `npm run typecheck`; full Jest suite passed. |

User behavior:

- Settings tab:
  - Add a dedicated measurement/unit section.
  - Add a weight unit preference with common options: grams, kilograms, ounces and pounds.
  - Add a toggle/switch to enable or disable weight/calorie tracking.
  - When disabled, weight and calories must not be shown in Today, Plan or Recipe edit/create UI.
  - When enabled, every recipe must have valid weight and calorie values.
- Recipes tab:
  - When tracking is enabled, recipe create/edit forms must include weight and calories fields.
  - Weight must use the selected weight unit in labels/help text.
  - Calories should be stored/displayed as calories per recipe, not per ingredient.
  - Save must reject missing, zero or invalid values when tracking is enabled.
  - When tracking is disabled, recipe create/edit must behave like the current flow and hide these fields.
- Today tab:
  - Each recipe row must show recipe name on the left and weight/calories on the right.
  - Reserve a maximum width/flex behavior for the recipe-name column so long names cannot overlap weight/calories.
  - Show total daily calories aligned on the right side of the Today header/title area.
  - Total daily calories are the sum of all recipes in the selected plan for the current weekday.
  - If tracking is enabled and one or more planned recipes miss weight/calorie data, show a clear error asking the user to either complete all recipe info or disable calorie tracking.
- Plan tab:
  - For each weekday, show the total calories for that day next to the weekday label.
  - Next to the plan name, show the plan calorie target/total in parentheses, for example `(2000 cal)`.
  - Meal slot rows follow the same layout rule as Today: recipe name constrained on the left, weight/calories on the right.
  - Editing, adding, removing and swapping recipes must update displayed totals immediately.

Domain/data model impact:

- Add optional recipe fields for weight amount and calories.
- Add preferences for weight unit and tracking enabled/disabled.
- Define validation rules:
  - tracking disabled: weight/calories can be absent and are ignored by totals;
  - tracking enabled: every recipe used in visible/planned meals must have valid positive weight and calorie values;
  - recipe save/edit should prevent invalid values when tracking is enabled;
  - imported data must be validated consistently before replacing local data.
- Decide whether existing recipes receive empty values during migration or a default placeholder; prefer empty values plus actionable validation when tracking is enabled.
- Keep calorie totals deterministic and derived from recipe data, not stored redundantly in plans.

Database/persistence impact:

- Add a local schema migration for recipe weight/calorie fields and app preferences.
- Ensure existing local databases upgrade without data loss.
- Ensure reset database restores default tracking preference and default unit.
- Persist and restore unit/tracking settings across app restarts.

CSV import/export impact:

- Update `IMPORT_EXPORT.md` before or during implementation.
- Add CSV fields/records for recipe weight, recipe calories, weight unit and tracking enabled preference.
- Keep backward compatibility with CSV files exported before this feature when possible.
- Validate imported unit values against supported units.
- Validate imported numeric fields before applying data.
- Export must include all new fields/preferences so a full app state round-trip preserves nutrition settings.

UI/UX impact:

- Avoid overlap in Today and Plan rows by using a stable two-column layout.
- Keep nutrition metadata compact; do not make meal cards visually noisy.
- Use localized labels and messages in Italian and English.
- Error messages must use the existing error styling; warnings use warning styling.
- Ensure light/dark contrast for the new labels, values and validation messages.
- Ensure mobile keyboard behavior remains usable for numeric inputs.

Testing/verification:

- Unit/domain tests for calorie total calculations, validation and preference behavior.
- Persistence/migration tests for existing data and new fields.
- CSV import/export tests for new fields, backward compatibility and invalid data.
- UI tests where practical for hidden/visible fields based on tracking toggle.
- Manual checks on web and mobile:
  - tracking disabled hides all weight/calorie UI;
  - tracking enabled requires recipe nutrition data;
  - Today daily total is correct;
  - Plan weekday and plan totals are correct;
  - long recipe names do not overlap weight/calorie values;
  - import/export round-trip preserves settings and values.

Documentation impact:

- Update `docs/requirements.md` if this becomes part of product behavior.
- Update `docs/architecture.md` for data model, persistence and CSV changes if implementation is accepted.
- Update `docs/design.md` only if new reusable UI layout rules/components are introduced.
- Update `IMPORT_EXPORT.md` for the CSV format change.
- Update `CHANGELOG.md` under the target release when implemented.

### TASK-069 - Ingredient-Level Quantity Fix

Goal: correct the nutrition model after local testing showed that recipe quantities belong to the ingredients inside the recipe, while calories remain a recipe-level value.

Subtasks:

| ID | Status | Scope | Completion Criteria | Verification |
| --- | --- | --- | --- | --- |
| TASK-069A | DONE | Domain and validation model. | Recipe keeps recipe-level calories; each selected recipe ingredient can carry a required free-form quantity when tracking is enabled; totals ignore legacy recipe-level weight. | `npm run typecheck`; recipe and meal plan domain tests passed. |
| TASK-069B | DONE | Persistence and migration. | Local DB stores quantities on recipe-ingredient relations instead of recipe rows; existing recipe weight data is migrated or safely ignored with no app crash; reset still works. | `npm run typecheck`; repository, migration and app persistence tests passed. |
| TASK-069C | DONE | CSV/import-export format. | `IMPORT_EXPORT.md` defines ingredient quantities inside recipe composition records; import/export round-trip preserves ingredient quantities and recipe calories; legacy CSV remains handled where feasible. | `npm run typecheck`; import/export CSV tests passed. |
| TASK-069D | DONE | Recipes UI create/edit. | In recipe edit/create, selected ingredient chips are left-aligned in a vertical list with a quantity input on the right; calories remain a recipe-level field; save validates missing ingredient quantities when tracking is enabled. | `npm run typecheck`; UI, app model and recipe domain tests passed. |
| TASK-069E | DONE | Recipe cards. | Recipe cards show calories aligned right on the recipe title row; ingredients are listed one per row with their quantity aligned beside each ingredient. | `npm run typecheck`; UI test for recipe card calories and ingredient quantities passed. |
| TASK-069F | DONE | Today and Plan display. | Today shows each recipe as a sub-card with recipe name and calories on the title row, then ingredient rows with quantities; Plan removes quantity display and keeps calorie totals only. | `npm run typecheck`; UI tests for Today and Plan nutrition display passed. |
| TASK-069G | DONE | Documentation and release notes. | Requirements, architecture, import/export docs and changelog reflect ingredient-level quantities without duplicating implementation details. | Documentation diff reviewed; `docs/requirements.md`, `docs/architecture.md`, `IMPORT_EXPORT.md` and `CHANGELOG.md` updated. |
| TASK-069H | TODO | User acceptance and manual smoke test. | User verifies the full ingredient-quantity flow on web and mobile/APK: create/edit recipe, recipe card, Today sub-card, Plan calorie-only display, CSV round-trip and persistence after app restart. | Manual test notes from user before closing TASK-069. |

User behavior:

- Recipes tab:
  - Calories remain editable at recipe level.
  - Quantity is entered per ingredient used by the recipe, for example `50 g` rice, `1 cucchiaino` oil, `10 ml` milk.
  - Unit text is entered by the user as part of the quantity; there is no global unit selector.
  - Selected ingredients must appear in a vertical list: ingredient tag/name on the left, quantity field on the right.
  - Recipe cards must show ingredients one per row with the corresponding quantity beside each ingredient.
  - Recipe title row must show recipe name on the left and calories on the right.
- Today tab:
  - Each planned recipe should appear as a compact sub-card.
  - The recipe sub-card title row shows recipe name and calories.
  - Under the title row, each ingredient appears on its own row with its quantity.
  - Long recipe and ingredient names must not overlap calories or quantity values.
- Plan tab:
  - Do not show recipe or ingredient quantity in plan cards.
  - Keep calorie totals at plan/day/recipe level where already required by `TASK-068`.

Impact notes:

- DB: quantity must belong to the recipe-ingredient association, not the recipe entity.
- Domain: recipe total weight is not stored; ingredient quantity is free-form text with user-defined unit.
- CSV: recipe composition rows need to carry ingredient quantity; file format documentation must be updated before release.
- UI: recipe ingredient selection needs a stable two-column row layout for ingredient label and quantity input.
- Tests: cover validation, migration, CSV round-trip and Today/Plan display behavior.

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
| FUTURE-003 | DEFERRED | Advanced nutrition planning beyond recipe-level weight/calorie tracking. |
| FUTURE-004 | DEFERRED | Shopping list generation. |
| FUTURE-005 | DEFERRED | Refactor remaining internal naming, legacy CSV/database fields and docs from weight-oriented terminology to quantity-oriented terminology while preserving backward compatibility. |
| FUTURE-006 | DEFERRED | Refactor technical naming and compatibility layer from recipe/Recipe to dish/Dish across domain, persistence, CSV schema, tests and docs while preserving import compatibility for legacy recipe records. |

## Update Rules

- Move a task to `DONE` only after its completion criteria and verification are satisfied.
- Mark blockers with the shortest useful reason.
- Update README/workflow/import-export docs when setup, commands, behavior or file formats change.
- Keep security-related work aligned with `docs/security.md`.
