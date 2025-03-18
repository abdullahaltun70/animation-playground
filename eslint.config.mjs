// eslint.config.mjs

import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		ignores: ['node_modules', '.*', 'public', 'coverage', 'out'],
		rules: {
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'import/order': [
				'error',
				{
					groups: [
						['external', 'builtin'],
						'internal',
						['sibling', 'parent'],
						'index',
					],
					pathGroups: [
						{
							pattern: 'react',
							group: 'external',
							position: 'before',
						},
						{
							pattern: '@src/**',
							group: 'internal',
						},
					],
					pathGroupsExcludedImportTypes: ['internal', 'react'],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],
		},
	},
];

export default eslintConfig;
