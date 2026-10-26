import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import { withApp } from '@sellgar/app/next';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  reactStrictMode: true,
  outputFileTracingRoot: root,
  turbopack: { root },
};
export default withApp(nextConfig, { application: './src/application/desktop.application.ts' });
