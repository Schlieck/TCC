import { defineConfig } from 'vitest/config';

// Só lógica pura (sem React Native): validações, formatação de períodos, HTML do PDF.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
