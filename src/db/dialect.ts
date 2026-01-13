import { PostgresDialect } from 'kysely';
import { pool } from './pool';

export const dialect = new PostgresDialect({
  pool,
});
