// eslint-disable-next-line n/no-extraneous-import
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import nodePlugin from 'eslint-plugin-n'

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  nodePlugin.configs['flat/recommended-script'],
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{js,mjs,ts}'],
    ignores: ['node_modules/**', 'build/**', 'src/lambda/build/**', 'src/lambda/node_modules/**'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './src/lambda/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: { parserOptions: { project: false } },
  },
  {
    rules: {
      //'prettier/prettier': 'warn',
      'node/no-missing-import': 'off',
      'node/no-unsupported-features/es-syntax': 'off',
      'no-console': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
)
