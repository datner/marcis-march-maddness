/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["@effect/io"],
  },
  compiler: {
    removeConsole: true,
  },
};

export default nextConfig;
