import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // tsconfig.json sets jsx:"preserve" for Next's own compiler, so the JSX in
  // the component tests needs its own transform here.
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    // Node by default; component tests opt into jsdom with a
    // `// @vitest-environment jsdom` pragma at the top of the file.
    environment: "node",
    setupFiles: ["tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
