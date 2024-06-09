import load_data, { LOCALES } from './src/langs/datt.server';
import type { langKey } from './src/langs/datt.server';
import * as fs from 'fs';

await build_lang_json_files();

async function build_lang_json_files() {
  makeFolder('./src/langs/data/json');
  for (const lcl of LOCALES) {
    const data = await load_data(lcl as langKey, true);
    fs.writeFileSync(`./src/langs/data/json/${lcl}.json`, JSON.stringify(data, null, 2));
  }

  async function makeFolder(path: string) {
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
  }
}
