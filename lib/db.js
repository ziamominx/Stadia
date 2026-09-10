import Database from 'better-sqlite3';
import { join } from 'node:path';

const dbPath = join(process.cwd(), 'server', 'data', 'fwwc.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
