import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
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
    ],
});
