import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // pdfkit reads its built-in font metrics (.afm) from disk at runtime. Bundling it breaks
  // those file lookups, so keep it external and let Node require it from node_modules.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
