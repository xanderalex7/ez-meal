import type { QueryExecutor, RepositoryResult } from './sqliteTypes';
import { isLanguage, type Language } from '../../shared/i18n';
import type { ThemeMode } from '../../shared/theme';

export function createPreferenceRepository(db: QueryExecutor) {
  return {
    async saveThemeMode(themeMode: ThemeMode, now: string): Promise<RepositoryResult<ThemeMode>> {
      try {
        await db.runAsync(
          'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?);',
          ['themeMode', themeMode, now],
        );
        return { ok: true, value: themeMode };
      } catch {
        return persistenceError();
      }
    },

    async getThemeMode(): Promise<RepositoryResult<ThemeMode>> {
      try {
        const row = await db.getFirstAsync<{ value: ThemeMode }>(
          'SELECT value FROM user_preferences WHERE key = ?;',
          ['themeMode'],
        );
        return { ok: true, value: row?.value ?? 'system' };
      } catch {
        return persistenceError();
      }
    },

    async saveLanguage(language: Language, now: string): Promise<RepositoryResult<Language>> {
      try {
        await db.runAsync(
          'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?);',
          ['language', language, now],
        );
        return { ok: true, value: language };
      } catch {
        return persistenceError();
      }
    },

    async getLanguage(): Promise<RepositoryResult<Language>> {
      try {
        const row = await db.getFirstAsync<{ value: string }>(
          'SELECT value FROM user_preferences WHERE key = ?;',
          ['language'],
        );
        return { ok: true, value: isLanguage(row?.value) ? row.value : 'it' };
      } catch {
        return persistenceError();
      }
    },
  };
}

function persistenceError(): RepositoryResult<never> {
  return {
    ok: false,
    error: {
      code: 'PERSISTENCE_ERROR',
      message: 'I dati locali non sono disponibili.',
    },
  };
}
