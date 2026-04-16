/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Required by Next.js 16 (Turbopack default) when no turbopack config is specified.
  // @perawallet/connect is 'use client' only, so no SSR fallbacks needed.
  turbopack: {},
}

export default nextConfig
