/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '10.91.38.104',
    '10.82.71.104',
    '10.231.243.104',
    '10.73.67.104',
    '10.228.194.104',
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
    ],
  },
};

export default nextConfig;