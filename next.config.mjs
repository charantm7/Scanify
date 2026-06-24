/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '10.147.190.104',
    '10.46.35.104'
  ],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'static.toiimg.com',
      },
    ],
  },
};

export default nextConfig;

