import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        // HTML pages — never cache, always fetch fresh
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'Cloudflare-CDN-Cache-Control', value: 'no-store' },
        ],
      },
      {
        // Hashed static assets — cache forever (hash changes on each deploy)
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
