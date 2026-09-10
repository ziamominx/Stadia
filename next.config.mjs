import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  async rewrites() {
    if (process.env.USE_EXPRESS_PROXY === 'true') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:4000/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
