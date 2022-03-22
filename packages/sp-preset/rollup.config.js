import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import visualizer from "rollup-plugin-visualizer";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import { terser } from "rollup-plugin-terser";
import nodeResolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

export default defineConfig([
  {
    input: "./src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "es",
      },
    ],
    plugins: [
      peerDepsExternal(),
      nodeResolve({ browser: true }),
      typescript({ tsconfig: "tsconfig.json" }),
      sizeSnapshot(),
      terser(),
      visualizer(),
    ],
  },
  {
    input: "./src/index.ts",
    output: [
      {
        file: "dist/index.amd.js",
        format: "amd",
        name: "SpPreset"
      },
    ],
    plugins: [
      nodeResolve(),
      typescript({ tsconfig: "tsconfig.json" }),
      sizeSnapshot(),
      terser(),
      visualizer(),
    ],
  },
]);
