import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    disabled: false,
    force: true
  },
  server: {
    fs: {
      strict: false
    }
  }
});
