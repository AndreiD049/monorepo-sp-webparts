---
to: rollup.config.js
unless_exists: true
sh: "npm i -D rollup rollup-plugin-typescript2 rollup-plugin-terser rollup-plugin-size-snapshot rollup-plugin-visualizer @rollup/plugin-node-resolve rollup-plugin-peer-deps-external"
---
import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import visualizer from 'rollup-plugin-visualizer';
import nodeResolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default defineConfig({
    input: './src/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'es',
        }
    ],
    plugins: [
        peerDepsExternal(),
        nodeResolve(),
        typescript({ tsconfig: 'tsconfig.json' }),
        sizeSnapshot(),
        terser(),
        visualizer(),
    ],
});
