/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
		include: ['**/?(*.)+(spec|test).[jt]s?(x)'],
		exclude: ['node_modules', 'dist', '.next', '.git'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			reportsDirectory: './coverage',
		},
		alias: {
			'@': resolve(__dirname, './src'),
			src: resolve(__dirname, './src'),
		},
	},
});
