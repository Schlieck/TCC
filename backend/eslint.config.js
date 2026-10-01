import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const onlyRelativeImports = {
  regex: String.raw`^(?!\.{1,2}/)`,
  message:
    'Domínio e aplicação não dependem de bibliotecas: declare uma porta em application/ports.',
};

const outerLayers = {
  regex: '(^|/)(adapters|main)(/|$)',
  message: 'As dependências apontam só para dentro: adapters → application → domain.',
};

export default defineConfig(
  globalIgnores(['dist', 'coverage']),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      eqeqeq: 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            onlyRelativeImports,
            outerLayers,
            {
              regex: '(^|/)application(/|$)',
              message: 'O domínio não conhece a camada de aplicação.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [onlyRelativeImports, outerLayers] }],
    },
  },
  {
    // response.body do supertest é any; os testes verificam a forma com expect.
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
);
