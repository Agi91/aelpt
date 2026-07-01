// ============================================================
// AELPT — Root ESLint Configuration
// This is the BASE config. Both apps/web and apps/server extend this.
// Constitution Reference: Section 04 (Engineering Principles), Section 15 (TypeScript Standards)
// ============================================================

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  // Parser: understands TypeScript syntax
  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  // Plugins that provide TypeScript-aware rules
  plugins: ['@typescript-eslint'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],

  rules: {
    // ----------------------------------------
    // CONSTITUTION RULE: P3 — Types Are Documentation
    // "any" type is FORBIDDEN. The compiler enforces every contract.
    // ----------------------------------------
    '@typescript-eslint/no-explicit-any': 'error',

    // ----------------------------------------
    // CONSTITUTION RULE: TypeScript Standards Section 15
    // Unused variables are noise. Fix or remove them.
    // ----------------------------------------
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',       // Allow _unused convention for intentional skips
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // ----------------------------------------
    // CONSTITUTION RULE: P5 — Fail Loudly, Recover Gracefully
    // Non-null assertions bypass TypeScript's null safety — use proper checks.
    // ----------------------------------------
    '@typescript-eslint/no-non-null-assertion': 'error',

    // ----------------------------------------
    // CONSTITUTION RULE: Section 18 — Error Handling Rules
    // Empty catch blocks silently swallow errors. This is FORBIDDEN.
    // ----------------------------------------
    'no-empty': ['error', { allowEmptyCatch: false }],

    // ----------------------------------------
    // CONSTITUTION RULE: P4 — Single Responsibility Everywhere
    // Console.log in production is noise and a potential security risk.
    // Use a proper logger service. (warn in dev, error in prod)
    // ----------------------------------------
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // ----------------------------------------
    // Code quality
    // ----------------------------------------
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // ----------------------------------------
    // TypeScript-specific good practices
    // ----------------------------------------
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' }, // Use "import type" for type-only imports (tree-shakeable)
    ],
    '@typescript-eslint/no-floating-promises': 'error',  // Never forget to await a promise
    '@typescript-eslint/await-thenable': 'error',        // Don't await non-promises
  },

  // ----------------------------------------
  // Files that should not be linted
  // ----------------------------------------
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    'coverage/',
    '*.js.map',
    '**/*.d.ts',
  ],
};
