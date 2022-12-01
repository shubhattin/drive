import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  server: {
    port: 3427,
    strictPort: true
  },
  resolve: {
    alias: {
      '@langs': path.resolve('./src/langs'),
      '@tools': path.resolve('./src/tools'),
      '@components': path.resolve('./src/components')
    }
  }
};

export default config;
