import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import nodeResolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from "autoprefixer";



export default defineConfig({
    input: './src/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'es',
        }
    ],
    plugins: [
        postcss({
            plugins: [
                autoprefixer,
            ],
            minimize: true,
        }),
        typescript({ tsconfig: 'tsconfig.json' }),
        peerDepsExternal(),
        nodeResolve(),
        terser(),
        visualizer(),
    ],
});
