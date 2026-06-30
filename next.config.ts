import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Evita que Next infiera mal la raíz del workspace (hay un yarn.lock en el home)
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
