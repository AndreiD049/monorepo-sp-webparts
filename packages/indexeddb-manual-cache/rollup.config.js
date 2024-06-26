import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import visualizer from 'rollup-plugin-visualizer';
import nodeResolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import clear from 'rollup-plugin-clear';

export default defineConfig({
    input: './src/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'es',
        }
    ],
    plugins: [
        clear({
            targets: ['dist']
        }),
        peerDepsExternal(),
        nodeResolve(),
        typescript({ tsconfig: 'tsconfig.json' }),
        sizeSnapshot(),
        terser(),
        visualizer(),
    ],
});
