import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    index: "src/index.ts",
    "ux-doctor-plugin": "src/rules/index.ts",
  },
  format: "esm",
  dts: true,
  clean: true,
  shims: true,
});
