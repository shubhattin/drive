import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// const routes = get_all_routes(['/', '/login']);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    vitePreprocess({
      postcss: true
    })
  ],
  kit: {
    adapter: adapter({
      runtime: 'edge'
    }),
    alias: {
      '@langs': './src/langs',
      '@tools': './src/tools',
      '@components': './src/components',
      '@state': './src/state',
      '@api': './src/api'
    }
    // prerender: {
    //   entries: routes
    // }
    // disabling prerender for now as using adapter-node
  }
};

export default config;
