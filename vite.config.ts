import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["**/routeTree.gen.ts"],
    sortTailwindcss: {
      stylesheet: "packages/ui/src/styles/tailwind.css",
      functions: ["cn", "cva"],
    },
    overrides: [
      {
        files: ["apps/site/**"],
        options: {
          sortTailwindcss: { stylesheet: "apps/site/src/App.css", functions: ["cn", "cva"] },
        },
      },
      {
        files: ["apps/settings/**"],
        options: {
          sortTailwindcss: { stylesheet: "apps/settings/src/index.css", functions: ["cn", "cva"] },
        },
      },
      {
        files: ["apps/docs/**"],
        options: {
          sortTailwindcss: { stylesheet: "apps/docs/src/app.css", functions: ["cn", "cva"] },
        },
      },
    ],
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    ignorePatterns: ["**/routeTree.gen.ts"],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
  pack: {
    dts: {
      generator: "tsgo",
    },
  },
});
