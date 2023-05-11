import { defineConfig } from "rollup";
import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";
import nodeResolve from '@rollup/plugin-node-resolve';


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
		typescript({ tsconfig: 'tsconfig.json' }),
		// terser(),
	],
	external: /@pnp/
});
