import esbuild from 'rollup-plugin-esbuild';
import autoExternal from 'rollup-plugin-auto-external';
import pkg from './package.json' assert { type: 'json' };
import dtsBundle from 'rollup-plugin-dts-bundle';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { uglify } from 'rollup-plugin-uglify';

export default () => {
	const mainInput = {
		input: 'src/adapter/index.ts',
		treeshake: true,
		output: {
			sourcemap: false,
			format: 'cjs',
			file: pkg.main,
			exports: 'named',
		},
		plugins: [
			json(),
			commonjs(),
			autoExternal({
				builtins: true,
				peerDependencies: true,
				dependencies: true,
			}),
			esbuild({
				minify: false,
				target: 'esnext',
			}),
			dtsBundle({
				bundle: {
					name: '@tyrsolutions/moleculer-db-typeorm-adapter',
					main: 'src/types/typeormadapter.d.ts',
					out: '../../dist/index.d.ts', // can be omitted, 'typings.d.ts' - default output.

					// Other 'dts-bundle' package options.
				},
			}),
			process.env.NODE_ENV === 'release' && uglify(),
		],
	};
	const esmInput = {
		...mainInput,
		output: {
			sourcemap: false,
			format: 'esm',
			file: pkg.module,
		},
	};
	return [mainInput, esmInput];
};
