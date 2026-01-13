import '../../envConfig';
import { pool } from '../db/pool';

async function clearData() {
  console.log('🧹 Clearing all data while keeping tables...');

  try {
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name != '_migrations'
      AND table_type = 'BASE TABLE';
    `);

    if (rows.length === 0) {
      console.log('No tables found to clear.');
      return;
    }

    const tableNames = rows.map((row: any) => `"${row.table_name}"`).join(', ');

    console.log(`Truncating tables: ${tableNames}`);

    await pool.query(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);

    console.log('✨ All data has been cleared. Tables are preserved.');
  } catch (err) {
    console.error('❌ Clear data failed:', err);
  } finally {
    await pool.end();
  }
}

clearData();
