import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    entry: 'src/index.ts',
    resolve: true
  },
  clean: true,
  sourcemap: true,
  minify: false,
  target: 'es2022',
  outDir: 'dist',
  splitting: false,
  treeshake: true
});