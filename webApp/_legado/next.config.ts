import type { NextConfig } from "next";

// Em dev o front encaminha /api/* para o webApi (porta 4000).
// Em produção, defina API_URL com o endereço público da API.
const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
