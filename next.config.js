/** @type {import('next').NextConfig} */
const isStatic = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  reactStrictMode: true,
  ...(isStatic
    ? {
        output: 'export',
        basePath: '/ton-gifts-market',
        images: { unoptimized: true },
      }
    : {
        images: {
          remotePatterns: [{ protocol: 'https', hostname: '**' }],
        },
        async headers() {
          return [
            {
              source: '/(.*)',
              headers: [
                { key: 'X-Frame-Options', value: 'ALLOWALL' },
                {
                  key: 'Content-Security-Policy',
                  value: "frame-ancestors 'self' https://web.telegram.org https://t.me",
                },
              ],
            },
          ];
        },
      }),
};

module.exports = nextConfig;
