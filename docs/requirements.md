# Requirements

## Vision

EZ-MEAL helps users plan weekly meals from ingredients and recipes they manage locally. The app must remain simple, offline-first and usable on mobile first, with Android, iOS and web support.

Target users are people who want a lightweight personal meal planner without accounts, cloud setup or complex nutrition tracking.

Expected value:

- know what to eat today based on the weekday;
- reuse available recipes and ingredients;
- create or randomly generate weekly plans;
- keep data portable through CSV import/export.

## Scope

Included in MVP:

- local ingredients, recipes and meal plans;
- recipe meal tags: breakfast, lunch, dinner;
- multiple recipes per meal slot;
- Monday-Sunday weekly plans;
- today view based on current weekday;
- random plan generation when enough recipes exist;
- CSV import/export;
- local database reset;
- light/dark/system theme;
- Italian/English language preference.

Excluded:

- accounts, authentication and cloud sync;
- calorie or macronutrient tracking;
- shopping list automation;
- external recipe providers;
- server-side APIs.

Future evolutions:

- richer nutrition data;
- shopping list generation;
- optional sync/backup;
- store-release pipelines.

## Actors and Use Cases

| Actor | Use case |
| --- | --- |
| User | Manage ingredients. |
| User | Manage recipes and assign ingredients. |
| User | Create, edit, delete and select meal plans. |
| User | Add, remove or swap recipes inside meal slots. |
| User | Generate a random plan draft and save it. |
| User | Import/export local data as CSV. |
| User | Change language, theme and reset local database. |

## User Stories

- As a user, I want to save ingredients so that recipes can reuse them.
- As a user, I want to create recipes with meal tags and ingredients so that plans are built from known meals.
- As a user, I want weekly plans with editable days and meals so that I can organize my week.
- As a user, I want lunch and dinner to support multiple recipes so that a meal can contain both protein and carbohydrate dishes.
- As a user, I want a Today tab so that I can quickly see meals for the current weekday.
- As a user, I want CSV import/export so that my data is portable.

## Functional Requirements

| Field | REQ-001 |
| --- | --- |
| Title | Manage ingredients |
| Description | The system must allow users to create, view and delete ingredients. |
| Rationale | Ingredients are the base data for recipes. |
| Actors | User |
| Preconditions | App is opened. |
| Main flow | User opens Ingredients, adds a name, sees the newest ingredient first, deletes if unused or after safe reference handling. |
| Alternatives/errors | Empty or duplicate invalid entries are rejected with user feedback. |
| Domain rules | Ingredient names must be non-empty after trimming. |
| Acceptance criteria | Given a valid ingredient name, When the user adds it, Then it appears in the ingredient list. |
| Impacts | Local data. |
| Priority | MUST |
| Status | Approved |
| Traceability | `docs/tasks.md` |

| Field | REQ-002 |
| --- | --- |
| Title | Manage recipes |
| Description | The system must allow users to create, edit, view and delete recipes with name, meal tag and selected ingredients. |
| Rationale | Recipes are the selectable items used by meal plans. |
| Actors | User |
| Preconditions | Ingredients may exist. |
| Main flow | User creates a recipe, selects a meal tag, selects zero or more ingredients, saves it and sees it newest first. |
| Alternatives/errors | Invalid data is rejected; deleting recipes used in plans must be handled without app errors. |
| Domain rules | Meal tag must be breakfast, lunch or dinner. |
| Acceptance criteria | Given a valid recipe, When saved, Then it is visible with meal tag and ingredient list. |
| Impacts | Local data, plan references. |
| Priority | MUST |
| Status | Approved |
| Traceability | `docs/tasks.md` |

| Field | REQ-003 |
| --- | --- |
| Title | Manage weekly plans |
| Description | The system must allow users to create, rename, edit, delete and select weekly meal plans. |
| Rationale | Users need multiple named planning contexts such as bulk or deficit. |
| Actors | User |
| Preconditions | Recipes may exist. |
| Main flow | User creates/selects a plan, edits the title, assigns recipes to Monday-Sunday breakfast/lunch/dinner slots and saves changes. |
| Alternatives/errors | Empty plans are allowed; deleting plans must not affect recipes or ingredients. |
| Domain rules | Week starts Monday and ends Sunday. |
| Acceptance criteria | Given a saved plan, When selected later, Then its title and meals are restored. |
| Impacts | Local data. |
| Priority | MUST |
| Status | Approved |
| Traceability | `docs/tasks.md`, `docs/decisions.md` |

| Field | REQ-004 |
| --- | --- |
| Title | Multiple recipes per meal slot |
| Description | The system must support one or more recipes in each plan meal slot. |
| Rationale | A meal can be composed of separate dishes, for example rice, chicken and fruit. |
| Actors | User |
| Preconditions | A plan and compatible recipes exist. |
| Main flow | User adds, removes or swaps recipes inside a meal slot. |
| Alternatives/errors | Only recipes compatible with the meal tag are selectable. |
| Domain rules | Breakfast slots accept breakfast recipes; lunch slots accept lunch recipes; dinner slots accept dinner recipes. |
| Acceptance criteria | Given three lunch recipes, When the user adds them to Monday lunch, Then all three remain visible after saving and reopening. |
| Impacts | Data model, CSV import/export, UI. |
| Priority | MUST |
| Status | Approved |
| Traceability | `docs/tasks.md` |

| Field | REQ-005 |
| --- | --- |
| Title | Random plan generation |
| Description | The system must generate a random editable plan draft only when enough compatible recipes exist. |
| Rationale | Automatic planning is a core convenience feature. |
| Actors | User |
| Preconditions | Compatible recipes exist for required meal slots. |
| Main flow | User taps Generate Plan, system fills empty slots with random compatible recipes, user can regenerate, edit and save. |
| Alternatives/errors | If recipes are insufficient, system explains what is missing. |
| Domain rules | Generated recipes must match the slot meal tag. |
| Acceptance criteria | Given enough recipes, When the user generates a plan, Then a draft plan is populated and can be saved. |
| Impacts | Local data, UX. |
| Priority | MUST |
| Status | Approved |
| Traceability | `docs/tasks.md` |

| Field | REQ-006 |
| --- | --- |
| Title | Today view |
| Description | The system must show meals for the current weekday from the selected plan. |
| Rationale | Users need quick daily access. |
| Actors | User |
| Preconditions | A plan is selected. |
| Main flow | App derives current weekday and displays matching breakfast/lunch/dinner meals. |
| Alternatives/errors | If no plan or meal exists, show an empty state. |
| Domain rules | Today is based on weekday only, not saved calendar dates. |
| Acceptance criteria | Given today is Wednesday, When the Today tab opens, Then Wednesday meals are shown. |
| Impacts | Date handling. |
| Priority | MUST |
| Status | Approved |
| Traceability | `docs/tasks.md`, `docs/decisions.md` |

| Field | REQ-007 |
| --- | --- |
| Title | CSV import/export |
| Description | The system must import and export all local app data using a single CSV file. |
| Rationale | Users need portable local backups without cloud services. |
| Actors | User |
| Preconditions | User opens Settings. |
| Main flow | User exports CSV or selects a CSV to import; system validates sections, updates data and reports success/failure. |
| Alternatives/errors | Invalid CSV is rejected without partially corrupting data. |
| Domain rules | Format is defined in `IMPORT_EXPORT.md`. |
| Acceptance criteria | Given an exported CSV, When imported into a clean app, Then ingredients, recipes, plans and preferences are restored. |
| Impacts | Data portability, validation. |
| Priority | MUST |
| Status | Approved |
| Traceability | `docs/tasks.md`, `IMPORT_EXPORT.md` |

| Field | REQ-008 |
| --- | --- |
| Title | Preferences and reset |
| Description | The system must allow theme selection, language selection and local database reset. |
| Rationale | Users need control over display and local data. |
| Actors | User |
| Preconditions | User opens Settings. |
| Main flow | User changes theme/language or confirms database reset. |
| Alternatives/errors | Destructive reset requires explicit confirmation. |
| Domain rules | Theme values are light, dark or system; languages are Italian and English. |
| Acceptance criteria | Given a changed preference, When app restarts, Then the preference is retained. |
| Impacts | Local data, UX. |
| Priority | MUST |
| Status | Approved |
| Traceability | `docs/tasks.md` |

## Non-Functional Requirements

- Offline-first: core flows must work without network.
- Performance: local lists and plan editing must feel immediate for personal-scale data.
- Reliability: delete/import/reset flows must not leave broken references.
- Compatibility: Android APK, iOS development build path and web export must remain viable.
- Maintainability: domain rules should remain testable outside UI where practical.
- Accessibility: text contrast, touch targets and keyboard behavior must be acceptable on mobile.
- Security/privacy: no accounts, no secrets in repo, no sensitive data logging.

## Inputs, Outputs and Validation

- Ingredient names: trim, require non-empty values.
- Recipe names: trim, require non-empty values.
- Meal tags: breakfast, lunch, dinner only.
- Plan titles: trim, fallback to a valid default when empty.
- CSV: validate header, row type, IDs, references, language and theme before applying.

## Assumptions and Constraints

- Data is personal and local to the device/browser.
- No backend is required for MVP.
- Generated plans are convenience drafts, not nutrition advice.
- English is the single maintained documentation language for the public repository.
