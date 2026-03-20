import { defineConfig } from "vite";

export default defineConfig({
  base: "/zip324wasm/",
  build: {
    sourcemap: false,
    target: "es2022",
  },
});
