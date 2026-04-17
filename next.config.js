/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs', 'nodemailer'],
  },
}

module.exports = nextConfig
