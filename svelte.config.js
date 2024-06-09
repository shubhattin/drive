import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import path from 'path';
// const routes = get_all_routes(['/', '/login']);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      postcss: true
    })
  ],
  kit: {
    adapter: adapter(),
    alias: {
      '@langs': path.resolve('./src/langs'),
      '@tools': path.resolve('./src/tools'),
      '@components': path.resolve('./src/components'),
      '@state': path.resolve('./src/state'),
      '@api': path.resolve('./src/api')
    }
    // prerender: {
    //   entries: routes
    // }
    // disabling prerender for now as using adapter-node
  }
};

export default config;
