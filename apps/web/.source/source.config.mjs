// source.config.ts
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
      extractLinkReferences: true
    },
    async: true
  }
});
var source_config_default = defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      langs: [
        "ts",
        "js",
        "html",
        "tsx",
        "mdx",
        "ini",
        "bash",
        "nix",
        "jsonc",
        "css"
      ],
      themes: {
        light: "catppuccin-latte",
        dark: "catppuccin-mocha"
      }
    }
  }
});
export {
  source_config_default as default,
  docs
};
