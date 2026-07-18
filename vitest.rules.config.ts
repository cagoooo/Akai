import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/firestore.rules.test.ts'],
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});
