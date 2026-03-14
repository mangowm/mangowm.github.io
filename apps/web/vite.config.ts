import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

import { ogPages } from "./src/generated/og-paths";

export default defineConfig({
  ssr: {
    external: ["@takumi-rs/image-response", "@takumi-rs/core", "@takumi-rs/helpers"],
  },
  optimizeDeps: {
    exclude: ["@takumi-rs/core"],
  },
  plugins: [
    mdx(await import("./source.config")),
    tailwindcss(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        autoSubfolderIndex: true,
        crawlLinks: true,
        concurrency: 4,
        retryCount: 1,
        retryDelay: 1000,
        failOnError: false,
        pages: [
          { path: "/" },
          { path: "/releases" },
          { path: "/editor" },
          { path: "/docs" },
          { path: "/api/search" },
          ...ogPages,
        ],
      },
    }),
    react(),
    nitro(),
  ],
});
