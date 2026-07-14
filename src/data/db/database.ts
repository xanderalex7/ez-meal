import * as SQLite from 'expo-sqlite';

import { consoleLogger } from '../../shared/logging';
import type { QueryExecutor } from '../repositories';
import { databaseName } from './schema';
import { migrateDatabase, type SqlValue } from './migrations';

export async function openAppDatabase(now = new Date().toISOString()): Promise<QueryExecutor> {
  const db = await SQLite.openDatabaseAsync(databaseName);
  await migrateDatabase({
    db: {
      execAsync: (source) => db.execAsync(source),
      getAllAsync: (source, params = []) => getAllRows(db, source, params),
      runAsync: (source, params) => runStatement(db, source, params),
    },
    logger: consoleLogger,
    now,
  });
  return {
    runAsync: (source, params) => runStatement(db, source, params),
    getAllAsync: (source, params = []) => getAllRows(db, source, params),
    getFirstAsync: (source, params = []) => getFirstRow(db, source, params),
  };
}

type SQLiteDatabaseLike = Awaited<ReturnType<typeof SQLite.openDatabaseAsync>>;

function runStatement(db: SQLiteDatabaseLike, source: string, params: SqlValue[]) {
  return params.length > 0 ? db.runAsync(source, params) : db.runAsync(source);
}

function getAllRows<T>(db: SQLiteDatabaseLike, source: string, params: SqlValue[]) {
  return params.length > 0 ? db.getAllAsync<T>(source, params) : db.getAllAsync<T>(source);
}

function getFirstRow<T>(db: SQLiteDatabaseLike, source: string, params: SqlValue[]) {
  return params.length > 0 ? db.getFirstAsync<T>(source, params) : db.getFirstAsync<T>(source);
}
