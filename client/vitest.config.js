import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  // Tests live outside client; use its installed dependencies without requiring
  // another package.json or duplicate node_modules in the tests directory.
  resolve: {
    alias: [
      { find: /^vitest$/, replacement: fileURLToPath(import.meta.resolve('vitest')) },
      { find: /^react$/, replacement: require.resolve('react') },
      { find: /^react-dom\/server$/, replacement: require.resolve('react-dom/server') },
    ],
  },
  test: {
    include: ['../tests/frontend/**/*.test.js'],
    environment: 'node',
  },
});
