# Import / Export CSV

EZ-MEAL uses one UTF-8 CSV file as the source of truth for import/export of local data.

The format is intentionally lightweight, human-readable, spreadsheet-friendly and suitable for LLM-assisted generation.

## File Name

Recommended:

```text
ez-meal-export.csv
```

## CSV Rules

- Encoding: UTF-8.
- Column separator: comma `,`.
- First row: exact mandatory header.
- Line endings: `LF` or `CRLF`.
- Empty values: empty cell.
- Booleans: `true` / `false`.
- Date-time: ISO 8601 UTC, for example `2026-07-04T12:00:00.000Z`.
- Day date: ISO `YYYY-MM-DD`.
- Lists: semicolon-separated values with no spaces, for example `lunch;dinner`.
- CSV escaping: values containing comma, quote or newline must be double-quoted; inner quotes are doubled.
- IDs are stable strings used to link rows.

Recommended row order:

```text
metadata, preference, ingredient, recipe, recipe_ingredient, meal_plan, meal_slot
```

## Mandatory Header

```csv
record_type,id,parent_id,key,name,value,available,meal_types,date,meal_type,recipe_id,week_start_date,created_at,updated_at,notes,weight_amount,calories
```

## Row Types

| `record_type` | Purpose |
| --- | --- |
| `metadata` | Format version and export metadata. |
| `preference` | User preferences: language, theme and nutrition settings. |
| `ingredient` | Available ingredients. |
| `recipe` | Recipes and meal tags. |
| `recipe_ingredient` | Recipe-to-ingredient relation. |
| `meal_plan` | Weekly meal plan. |
| `meal_slot` | Single meal slot inside a plan. |

## Required Metadata

```csv
metadata,format,,schema_version,,3,,,,,,,,,,,
metadata,export,,app_name,,EZ-MEAL,,,,,,,,,,,
metadata,export,,exported_at,,2026-07-14T10:00:00.000Z,,,,,,,,,,,
```

## Preferences

Supported preferences:

- `language`: `it` or `en`
- `themeMode`: `system`, `light` or `dark`
- `nutritionTrackingEnabled`: `true` or `false`
- `weightUnit`: legacy preference retained for backward compatibility; new ingredient quantities include their unit as text

Example:

```csv
preference,language,,language,,it,,,,,,,,2026-07-14T10:00:00.000Z,,,
preference,themeMode,,themeMode,,system,,,,,,,,2026-07-14T10:00:00.000Z,,,
preference,nutritionTrackingEnabled,,nutritionTrackingEnabled,,true,,,,,,,,2026-07-14T10:00:00.000Z,,,
preference,weightUnit,,weightUnit,,g,,,,,,,,2026-07-14T10:00:00.000Z,,,
```

## Ingredients

Required columns:

- `record_type`: `ingredient`
- `id`
- `name`
- `available`: `true` / `false`
- `created_at`
- `updated_at`

Example:

```csv
ingredient,ingredient-1,,,Pomodoro,,true,,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,,,
```

## Recipes

Required columns:

- `record_type`: `recipe`
- `id`
- `name`
- `meal_types`: `breakfast`, `lunch`, `dinner`, separated by `;`
- `created_at`
- `updated_at`

Optional columns:

- `calories`: positive number, calories for the whole recipe

Example:

```csv
recipe,recipe-1,,,Pasta al pomodoro,,,lunch;dinner,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,,,520
```

If `nutritionTrackingEnabled` is `true`, every recipe must include valid `calories`.

## Recipe Ingredients

Use one row per ingredient used by a recipe.

```csv
recipe_ingredient,recipe-1__ingredient-1,recipe-1,,,ingredient-1,,,,,,,,,,50,
```

- `parent_id`: recipe ID.
- `value`: ingredient ID.
- `weight_amount`: free-form ingredient quantity including the user-chosen unit, for example `50 g`, `1 cucchiaino`, `10 ml`.

If `nutritionTrackingEnabled` is `true`, every `recipe_ingredient` row must include a non-empty `weight_amount`.

## Meal Plans

Required columns:

- `record_type`: `meal_plan`
- `id`
- `name`
- `week_start_date`
- `created_at`
- `updated_at`

Example:

```csv
meal_plan,plan-current,,,Piano settimanale,,,,,,,2026-06-29,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,,,
```

## Meal Slots

Each plan must contain exactly 21 `meal_slot` rows: 7 days x 3 meals.

Required columns:

- `record_type`: `meal_slot`
- `id`
- `parent_id`: plan ID
- `date`
- `meal_type`: `breakfast`, `lunch`, `dinner`
- `recipe_id`: empty, one recipe ID, or several recipe IDs separated by `;`

Example with multiple recipes:

```csv
meal_slot,plan-current__2026-06-29__lunch,plan-current,,,,,,2026-06-29,lunch,recipe-riso;recipe-pollo;recipe-frutta,,,,,,
```

## Import Must Fail If

- mandatory header is missing or changed;
- `schema_version` is not `1` or `2`;
- unsupported `record_type`;
- required IDs or names are empty;
- invalid boolean/date/meal type;
- unsupported language, theme, nutrition tracking value or legacy weight unit;
- invalid or incomplete recipe `calories`;
- empty ingredient `weight_amount` when nutrition tracking is enabled;
- `nutritionTrackingEnabled` is `true` and at least one recipe has missing calories or ingredient quantities;
- a relation points to a missing ingredient, recipe or plan;
- a planned recipe is not compatible with the slot `meal_type`;
- duplicate recipe IDs exist in the same slot;
- a plan does not have exactly 21 slots;
- a plan contains duplicate `date` + `meal_type` slots;
- IDs are duplicated for the same `record_type`.

## Recommended Import Strategy

1. Read the full CSV in memory.
2. Split rows by `record_type`.
3. Validate structure, values and references.
4. Build the full app model.
5. Show an import summary.
6. Write to the database only after full validation succeeds.

## Compatibility

- Current schema version: `3`.
- Schema version `1` files without `weight_amount`, `calories`, `nutritionTrackingEnabled` and `weightUnit` are still accepted.
- Schema version `2` files with recipe-level `weight_amount` are accepted; when a recipe has exactly one ingredient, the legacy recipe weight can be mapped to that ingredient quantity.
- Single recipe slots and multi-recipe slots are both supported through `meal_slot.recipe_id`.
