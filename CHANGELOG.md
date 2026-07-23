# Changelog

All notable EZ-MEAL changes are tracked here.

This project follows semantic versioning for public app versions. Release process and tag commands are documented in `WORKFLOW.md` and `tagging.md`.

## 1.5.0 - Unreleased

### Added

- Pantry/shopping flow in the Ingredients tab with `Dispensa` and `Spesa` views.
- Ingredient availability state exposed in the UI as available/missing.
- Shopping-list swipe and icon fallback actions for moving ingredients between pantry and shopping states.
- Filled cart and cart-plus icons for shopping actions.
- Ingredient deletion confirmation modal.

### Changed

- Missing ingredients remain visible in `Dispensa` with a warning-style background.
- Ingredient deletion is available only from `Dispensa`, not from `Spesa`.
- Improved app header safe-area spacing on mobile devices.

## 1.4.0 - 2026-07-23

### Added

- Ingredient list filtering from the Ingredients tab.
- Recipe list filtering by recipe name.
- Alphabetical ingredient ordering for easier lookup.
- Alphabetical recipe ordering for easier lookup.
- Cropped wordmark logo assets for the app header.
- Optional nutrition tracking for recipe calories and ingredient-level quantities.
- UX copy now refers to planned items as dishes instead of recipes.

### Changed

- Reworked the app header to use the official logo instead of text.
- Reduced subtitle visual weight in the app header.
- Improved Today card spacing.
- Improved bottom navigation safe-area behavior on Android devices.
- Improved recipe creation UX around ingredient selection.
- Improved warning and error message styling with distinct colors.
- Improved recipe editing flow by bringing the edit form into view.
- Moved quantity tracking from recipe level to ingredient level.
- Updated Today and Plan nutrition displays: Today shows ingredient quantities, while Plan keeps calorie-only summaries.

### Fixed

- Prevented recipes from being saved without ingredients.
- Closed the ingredient multi-select dropdown when focus leaves the search area.
- Improved contrast and readability for user-facing feedback states.

## 1.2.2 - 2026-07-15

### Added

- GitHub Pages workflow for stable web deployment from `main`.
- Public-repository documentation cleanup in English.

### Fixed

- Web asset paths for GitHub Pages deployment.

## 1.2.1 - 2026-07-15

### Added

- Version bump and tag helper scripts.
- Release workflow documentation for version alignment and tagging.

### Changed

- Documented the release candidate flow and APK pipeline branch usage.

## 1.2.0 - 2026-07-15

### Added

- New official logo and app icon assets.

### Fixed

- PNG logo generation quality for closer alignment with SVG assets.

## 1.1.1 - 2026-07-15

### Fixed

- Today view now resolves meals by weekday instead of relying on calendar date-specific plan data.

## 1.1.0 - 2026-07-15

### Added

- Multiple recipes per meal slot.

### Changed

- Updated plan data, CSV import/export and UI flows to support multiple recipes for breakfast, lunch and dinner.

## 1.0.0 - 2026-07-15

### Added

- Initial advanced MVP baseline.
- Local-first ingredient, recipe and weekly meal planning flows.
- Today view.
- Random meal plan generation.
- Light, dark and system theme support.
- Italian and English UI language support.
- CSV import/export for local data portability.
- Local database reset.
- Android APK build workflow baseline.
