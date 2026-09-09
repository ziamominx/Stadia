/** @type {import('next').NextConfig} */
const nextConfig = {
  // Built-in Next.js route handlers in app/api serve all endpoints natively on Vercel and production
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
