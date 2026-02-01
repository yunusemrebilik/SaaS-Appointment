import '../envConfig';
import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    UPLOADTHING_TOKEN: z.string(),
  },

  client: {},

  experimental__runtimeEnv: {},

  emptyStringAsUndefined: true,
});
