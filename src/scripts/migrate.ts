import '../../envConfig';
import fs from 'fs';
import path from 'path';
import { pool } from '../db/pool';

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id BIGINT GENERATED ALWAYS AS IDENTITY,
        name TEXT UNIQUE NOT NULL,
        run_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const { rows: executedRows } = await pool.query('SELECT name FROM _migrations');
    const executedMigrations = new Set(executedRows.map((row) => row.name));

    for (const file of files) {
      if (!executedMigrations.has(file)) {
        console.log(`Running migration: ${file}...`);

        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        // transaction for each migration
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`Success: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`Failed: ${file}`, err);
          process.exit(1);
        } finally {
          client.release();
        }
      }
    }

    console.log('All migrations up to date.');
  } catch (err) {
    console.error('Migration script error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
