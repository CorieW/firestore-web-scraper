import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 10000,
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', 'lib/**'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      include: ['src/**'],
      exclude: ['lib/**', 'node_modules/**', '**/*.test.ts', '**/test/**'],
      reporter: ['text', 'json', 'html', 'clover']
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})