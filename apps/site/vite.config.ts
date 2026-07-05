import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({
      plugins: ["babel-plugin-react-compiler"],
    }),
  ],
});
