import type { NextConfig } from "next";

// Output environment variables and runtime info at startup
console.log("\n╔═══════════════════════════════════════════════════════╗");
console.log("║        GOV Route Library - Startup Information       ║");
console.log("╚═══════════════════════════════════════════════════════╝");

console.log("\n📊 Runtime Information:");
console.log("  Node Version:     ", process.version);
console.log("  Platform:         ", process.platform);
console.log("  Architecture:     ", process.arch);
console.log("  Environment:      ", process.env.NODE_ENV || "development");
console.log("  Port:             ", process.env.PORT || "3000 (default)");
console.log("  Started:          ", new Date().toISOString());

console.log("\n⚙️  Runtime Configuration:");
console.log(
  "  SEARCH_API_URL:       ",
  process.env.SEARCH_API_URL || process.env.NEXT_PUBLIC_SEARCH_API_URL || "(not set)"
);
console.log(
  "  ENABLE_FILTERS:       ",
  process.env.ENABLE_FILTERS || process.env.NEXT_PUBLIC_ENABLE_FILTERS || "false"
);

console.log("\n" + "─".repeat(55) + "\n");

const nextConfig: NextConfig = {
  output: 'standalone',
  crossOrigin: 'anonymous',
};

export default nextConfig;
