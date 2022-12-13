import lang_data from './locales.json';
import { load } from 'js-yaml';
import { set_val_from_adress } from '@tools/json';
import * as fs from 'fs';
import type { dattType } from './model';
const list = lang_data.locales;
const default_locale = lang_data.default_locale;

export type { dattType } from './model';
export { default_locale } from './locales.json';
export type langKey = keyof typeof list; // Language list
export const langNames = Object.values(list);
export const get_locale = (locale: string) => (locale || default_locale) as langKey;

const reuseValues = (datt: dattType) => {
  const { drive } = datt;
  const reuseMap: [string, string[]][] = [
    [drive.login.reset.blank_msg, ['datt.drive.login.new_user.blank_msg']],
    [
      drive.main.fileBar.Delete.yes,
      ['datt.drive.main.fileBar.Logout.yes', 'datt.drive.main.fileBar.Upload.yes']
    ],
    [
      drive.main.fileBar.NewFolder.no,
      ['datt.drive.main.fileBar.Delete.no', 'datt.drive.main.fileBar.Logout.no']
    ],
    [drive.main.fileBar.Download.download_msg, ['datt.drive.main.fileBar.FileView.download_msg']]
  ];
  for (const x of reuseMap)
    for (const y of x[1]) set_val_from_adress(y.substring(4).split('.').join('/'), datt, x[0]);
  return datt;
};
const db: { [x in langKey]?: dattType } = {};
const main = (locale: langKey) => {
  if (process.env.NODE_ENV === 'production' && locale in db) return db[locale];
  const LOAD: any = load(fs.readFileSync(`./src/langs/data/${list[locale]}.yaml`).toString());
  const dt = reuseValues(LOAD.client as dattType);
  db[locale] = dt;
  return dt;
};
export default main;
