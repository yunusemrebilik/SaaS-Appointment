import { env } from '../env';
import { Pool } from 'pg';

// Only use SSL when connecting to remote databases (not localhost)
const isLocalhost =
  env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1');

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});
