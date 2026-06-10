import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages のリポジトリパスに合わせて base を設定する
export default defineConfig({
  base: "/dx-antenna/",
  plugins: [react()],
});
