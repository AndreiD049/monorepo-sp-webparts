import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import visualizer from "rollup-plugin-visualizer";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import { terser } from "rollup-plugin-terser";
import nodeResolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import replace from "@rollup/plugin-replace";

export default defineConfig([
  {
    input: "./src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "es"
      }
    ],
    external: [
        "office-ui-fabric-react",
        "uuid",
    ],
    plugins: [
      peerDepsExternal(),
      nodeResolve({ browser: true }),
      typescript({ tsconfig: "tsconfig.json" }),
      postcss({
        plugins: [autoprefixer],
        minimize: true,
      }),
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
        name: "spReactNotifications",
        globals: {
          "react": "React",
          "react-dom": "ReactDOM",
        },
      },
    ],
    plugins: [
      peerDepsExternal(),
      nodeResolve({ browser: true }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
        preventAssignment: true,
      }),
      typescript({ tsconfig: "tsconfig.json" }),
      postcss({
        plugins: [autoprefixer],
        minimize: true,
      }),
      sizeSnapshot(),
      terser(),
      visualizer(),
    ],
  },
]);
