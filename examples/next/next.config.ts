import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Workspace packages ship untranspiled ESM; let Next compile them (still required in Next 16).
  transpilePackages: ['@aristocraft/ui', '@aristocraft/tokens'],
};

export default nextConfig;
