import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import { get_all_routes } from './src/tools/i18n/get_all_routes.js';

const routes = get_all_routes(['/drive', '/drive/login']);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      postcss: true
    })
  ],
  kit: {
    adapter: adapter(),
    prerender: {
      entries: routes
    }
  }
};

export default config;
