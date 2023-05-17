import { defineConfig } from "rollup";
import typescript from 'rollup-plugin-typescript2';
import nodeResolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH

export default defineConfig({
	input: './src/index.ts',
	output: [
		{
			file: 'dist/index.js',
			format: 'es',
			sourcemap: production ? true : 'inline'
		}
	],
	plugins: [
		nodeResolve(),
		peerDepsExternal(),
		typescript({ tsconfig: './tsconfig.json' }),
		terser(),
	],
	external: /@pnp/
});
