import esbuild from 'rollup-plugin-esbuild';
import autoExternal from 'rollup-plugin-auto-external';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from './package.json' assert { type: 'json' };

export default () => {
	const mainInput = {
		input: 'src/adapter/index.ts',
		treeshake: true,
		output: {
			sourcemap: false,
			format: 'cjs',
			file: pkg.main,
		},
		plugins: [
			autoExternal({
				builtins: true,
				peerDependencies: true,
				dependencies: true,
			}),
			esbuild({
				minify: false,
				target: 'esnext',
			}),
			nodeResolve(),
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
