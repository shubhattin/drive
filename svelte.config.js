import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

// const routes = get_all_routes(['/', '/login']);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      postcss: true
    })
  ],
  kit: {
    adapter: adapter({})
    // prerender: {
    //   entries: routes
    // }
    // disabling prerender for now as using adapter-node
  }
};

export default config;
