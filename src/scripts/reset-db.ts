import '../../envConfig';
import { pool } from '../db/pool';

async function reset() {
  console.log('🗑️  Destroying database schema...');

  try {
    // This nuclear command drops all tables, types, and data in the public schema
    await pool.query('DROP SCHEMA public CASCADE;');
    await pool.query('CREATE SCHEMA public;');
    await pool.query('GRANT ALL ON SCHEMA public TO public;'); // Restore permissions

    console.log('✨ Database is now crystal clear.');
  } catch (err) {
    console.error('❌ Reset failed:', err);
  } finally {
    await pool.end();
  }
}

reset();
