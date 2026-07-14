import type { QueryExecutor } from '../../data/repositories';
import type { SqlValue } from '../../data/db';

export function createFakeQueryExecutor() {
  const runs: Array<{ source: string; params: SqlValue[] }> = [];
  const allRows = new Map<string, unknown[]>();
  const firstRows = new Map<string, unknown | null>();

  const db: QueryExecutor = {
    runAsync: async (source, params) => {
      runs.push({ source, params });
      return {};
    },
    getAllAsync: async <T>(source: string) => (allRows.get(source) ?? []) as T[],
    getFirstAsync: async <T>(source: string) => (firstRows.get(source) ?? null) as T | null,
  };

  return {
    db,
    runs,
    allRows,
    firstRows,
  };
}
