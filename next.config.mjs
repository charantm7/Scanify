/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '10.147.190.104'
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