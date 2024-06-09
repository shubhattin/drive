import { sveltekit } from '@sveltejs/kit/vite';
import { lang_data_json_build_plugin } from './src/langs/json_build_plugin';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit(), lang_data_json_build_plugin()],
  server: {
    port: 3427,
    strictPort: true
  }
};

export default config;
