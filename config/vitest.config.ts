import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: '.',
  test: {
    environment: 'node',
    testTimeout: 10000,
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'lib/**', 'example/**'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      include: ['src/**'],
      exclude: ['lib/**', 'node_modules/**', '**/*.test.ts', '**/test/**'],
      reporter: ['text', 'json', 'html', 'clover'],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
