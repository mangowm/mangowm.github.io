import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [
    react(),
    babel({
      plugins: ["babel-plugin-react-compiler"],
    }),
  ],
});
