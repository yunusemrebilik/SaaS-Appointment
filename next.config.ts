import type { NextConfig } from 'next';
import '@/env'; // to allow dev-time scripts (e.g., pnpx src/scripts/migrate.ts) to access env vars

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
    ],
  },
};

export default nextConfig;
