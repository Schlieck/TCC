import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Só lógica pura (sem React Native): validações, máscaras, períodos, HTML do PDF e o esquema
// do banco local (via node:sqlite).
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
