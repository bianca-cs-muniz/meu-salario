import path from "node:path";
import { defineConfig } from "vitest/config";

// Mesmos aliases do tsconfig.json (baseUrl = src).
const src = (pasta: string) => path.resolve(__dirname, "src", pasta);

export default defineConfig({
  resolve: {
    alias: {
      "@config": src("config"),
      "@database": src("database"),
      "@erros": src("errors"),
      "@helpers": src("shared/helpers"),
      "@middlewares": src("shared/middlewares"),
      "@abstracts": src("utils/abstracts"),
      "@decorators": src("utils/decorators"),
      "@dtos": src("utils/dtos"),
      "@tipos": src("utils/types"),
      "@modulos": src("modules"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
