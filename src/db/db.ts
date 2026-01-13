import { DB } from '@/types/db';
import { CamelCasePlugin, Kysely } from 'kysely';
import { dialect } from './dialect';

export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});
