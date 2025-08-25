// eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';

// typescript-eslint (v7+ or v8) flat config entrypoint
import tseslint from 'typescript-eslint';

// Plugins
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import next from '@next/eslint-plugin-next';
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const config = [
  ...compat.config({
    extends: ['eslint:recommended', 'next'],
  }),

  // Ignore build artifacts
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'coverage/**',
    ],
  },

  // Base JS/TS/React/Next rules (type-aware)
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        // Enable type-aware rules; keep fast by pointing to a single tsconfig
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      // name: object
      '@typescript-eslint': tseslint.plugin,
      react,
      'react-hooks': hooks,
      'jsx-a11y': jsxA11y,
      '@next/next': next,
    },
    settings: {
      react: { version: 'detect' },
      next: { rootDir: ['.'] },
    },
    rules: {
      // ----- Baseline recommended rule sets -----
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommendedTypeChecked[0].rules, // core typed rules
      ...tseslint.configs.stylisticTypeChecked[0].rules,   // typed stylistic rules
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,

      // ----- Quality & consistency tweaks -----
      // Prefer TS-aware no-unused-vars
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],

      // Keep imports tidy with TS
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // Next/React modern defaults
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // Optional: help avoid fragile parent-relatives
      // (adjust to your project structure)
      // 'no-restricted-imports': ['error', { patterns: ['../*'] }],

      // Accessibility: already covered by jsx-a11y recommended,
      // but you can tighten further if desired.
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/label-has-associated-control": "off",
    },
  },

  // TypeScript-only adjustments
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // no-undef doesn't understand TS types—disable it for TS
      'no-undef': 'off',
    },
  },

  // Test files (Jest/Vitest globals, looser rules)
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default config;
