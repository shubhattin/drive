import type { PluginOption } from 'vite';
import load_data, { LOCALES } from './datt.server';
import * as fs from 'fs';
import type { langKey } from './datt.server';

async function build_lang_json_files() {
  deleteFolder('./src/langs/data/json');
  fs.mkdirSync('./src/langs/data/json', { recursive: true });
  for (const lcl of LOCALES) {
    const data = await load_data(lcl as langKey, true);
    fs.writeFileSync(`./src/langs/data/json/${lcl}.json`, JSON.stringify(data, null, 2));
  }

  function deleteFolder(path: string) {
    if (fs.existsSync(path)) fs.rmSync(path, { recursive: true, force: true });
  }
}

/**
 * Vite plugin to build json files from the yaml files for use in production
 */
export const lang_data_json_build_plugin = () => {
  return {
    name: 'build lang json files',
    async buildStart() {
      await build_lang_json_files();
    }
  } satisfies PluginOption;
};
