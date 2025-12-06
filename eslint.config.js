import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  // Игнорируемые директории
  {
    ignores: [
      'dist/**',
      'dev-dist/**',
      'node_modules/**',
      'playwright-report/**',
      '*.config.js',
      '*.config.ts',
      'scripts/**',
    ],
  },

  // Базовые правила JS
  js.configs.recommended,

  // TypeScript правила
  ...tseslint.configs.recommended,

  // React конфигурация
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React правила
      'react/react-in-jsx-scope': 'off', // Не нужен импорт React в React 17+
      'react/prop-types': 'off', // Используем TypeScript
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Общие правила
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-unused-expressions': 'off',
    },
  },

  // Тесты - менее строгие правила
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  }
);
