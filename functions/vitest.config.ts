import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 10000,
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', 'lib/**'],
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})