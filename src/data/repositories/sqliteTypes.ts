import type { SqlValue } from '../db';

export type QueryExecutor = {
  runAsync: (source: string, params: SqlValue[]) => Promise<unknown>;
  getAllAsync: <T>(source: string, params?: SqlValue[]) => Promise<T[]>;
  getFirstAsync: <T>(source: string, params?: SqlValue[]) => Promise<T | null>;
};

export type RepositoryResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: {
        code: 'PERSISTENCE_ERROR';
        message: string;
      };
    };
