import * as fs from 'fs';

const locales = JSON.parse(fs.readFileSync('./src/langs/locales.json').toString()).locales;
/**
 * @param {string[]} route_list
 * @returns string[]
 */
export const get_all_routes = (route_list) => {
  /**
   * @type string[] res
   */
  let res = [];
  /**
   * @param {string} locale
   */
  const get_all_links = (locale) => {
    for (let link of route_list) {
      const prefix = locale === '' ? '' : `/${locale}`;
      res.push(`${prefix + (link === '/' && prefix !== '' ? '' : link)}`);
    }
  };
  for (let x in locales) get_all_links(x);
  get_all_links('');
  return res;
};
