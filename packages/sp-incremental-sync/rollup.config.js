import { defineConfig } from "rollup";
import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";
import nodeResolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';


export default defineConfig({
	input: './src/index.ts',
	output: [
		{
			file: 'dist/index.js',
			format: 'es'
		}
	],
	plugins: [
		nodeResolve(),
		peerDepsExternal,
		typescript({ tsconfig: 'tsconfig.json' }),
		// terser(),
	],
	external: /@pnp/
});
