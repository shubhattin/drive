import lang_data from './locales.json';
import { load } from 'js-yaml';
import { set_val_from_adress } from '@tools/json';
import * as fs from 'fs';
import type { dattType } from './model';

const LANG_LIST = lang_data.locales;
export type langKey = keyof typeof LANG_LIST; // Language list
export const LANG_NAMES = Object.values(LANG_LIST);
export const LOCALES = Object.keys(LANG_LIST);
export const get_locale = (locale: string) => (locale || DEFAULT_LOCALE) as langKey;

export const DEFAULT_LOCALE = lang_data.default_locale as langKey;

const reuseValues = (datt: dattType) => {
  const { drive } = datt;
  const reuseMap: [string, string[]][] = [
    [drive.login.reset.blank_msg, ['drive.login.new_user.blank_msg']],
    [
      drive.main.fileBar.Delete.yes,
      ['drive.main.fileBar.Logout.yes', 'drive.main.fileBar.Upload.yes']
    ],
    [
      drive.main.fileBar.NewFolder.no,
      [
        'drive.main.fileBar.Delete.no',
        'drive.main.fileBar.Logout.no',
        'drive.main.fileBar.Rename.no'
      ]
    ],
    [drive.main.fileBar.Download.download_msg, ['drive.main.fileBar.FileView.download_msg']],
    [drive.login.reset.msg_codes.user_not_found, ['drive.login.drive_auth_msgs.user_not_found']]
  ];
  for (const x of reuseMap)
    for (const y of x[1]) set_val_from_adress(`/${y.split('.').join('/')}`, datt, x[0]);
  return datt;
};
// @ts-ignore
const db: { [x in langKey]: dattType } = {};
const main = (locale: langKey) => {
  if (process.env.NODE_ENV === 'production' && locale in db) return db[locale];
  const LOAD: any = load(fs.readFileSync(`./src/langs/data/${LANG_LIST[locale]}.yaml`).toString());
  const dt = reuseValues(LOAD as dattType);
  db[locale] = dt;
  return dt;
};
export default main;
