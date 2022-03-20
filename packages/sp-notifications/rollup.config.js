import { defineConfig } from "rollup";
import typescript from 'rollup-plugin-typescript2';
import visualizer from "rollup-plugin-visualizer";
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import { terser } from "rollup-plugin-terser";
import nodeResolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from "autoprefixer";


export default defineConfig({
    input: './src/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'es'
        }
    ],
    plugins: [
        peerDepsExternal(),
        nodeResolve(),
        typescript({ tsconfig: 'tsconfig.json' }),
        postcss({
            plugins: [
                autoprefixer,
            ],
            minimize: true,
        }),
        sizeSnapshot(),
        terser(),
        visualizer(),
    ]
});