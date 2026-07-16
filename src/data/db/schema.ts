export const databaseName = 'ez-meal.db';

export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    meal_types TEXT NOT NULL,
    ingredient_ids TEXT NOT NULL,
    weight_amount REAL,
    calories INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    available INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS meal_plans (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Piano settimanale',
    week_start_date TEXT NOT NULL,
    days TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS user_preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  'CREATE INDEX IF NOT EXISTS idx_meal_plans_week_start_date ON meal_plans(week_start_date);',
  'CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);',
] as const;
