/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },

      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },

      // Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },

      // AWS S3
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },

      // DigitalOcean Spaces
      {
        protocol: 'https',
        hostname: '*.digitaloceanspaces.com',
      },

      // Cloudflare Images / R2
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },

      // Imgur
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },

      // ImageKit
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },

      // Firebase Storage
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },

      // GitHub
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },

      // Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },

      // Pexels
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },

      // Pixabay
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },

      // Freepik CDN
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },

      // Wikimedia
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
};

export default nextConfig;

