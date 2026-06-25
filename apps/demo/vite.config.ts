import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// react-native-web ships untranspiled JSX inside `.js` files and references
// `__DEV__` / `global`, so we teach esbuild + Vite about both.
export default defineConfig({
  plugins: [react()],
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
    global: "window",
  },
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
    extensions: [".web.tsx", ".web.ts", ".tsx", ".ts", ".web.js", ".js", ".jsx", ".json"],
    dedupe: ["react", "react-dom", "react-native-web"],
  },
  optimizeDeps: {
    include: ["react-native-web", "react-native-debounce-input"],
    esbuildOptions: {
      loader: { ".js": "jsx" },
      resolveExtensions: [".web.js", ".js", ".ts", ".tsx"],
    },
  },
});
