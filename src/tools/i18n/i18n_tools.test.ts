import { describe, expect, it } from 'vitest';
import { get_locale_from_url, default_locale, get_link } from './index';

describe('Testing i18n Related Functions', () => {
  it('get_locale_from_url', () => {
    const TEST_LIST = [
      ['/', default_locale],
      ['/en', 'en'],
      ['/hi', 'hi'],
      ['/ta', 'ta'],
      ['/ml', 'ml'],
      ['/ml/login/drive/test', 'ml'],
      ['/en/login/drive', 'en']
    ];
    for (let test_item of TEST_LIST) expect(get_locale_from_url(test_item[0])).toBe(test_item[1]);
  });

  it('get_link', () => {
    const TEST_LIST = [
      ['/ml/test', default_locale, '/test'],
      [`/${default_locale}/login`, default_locale, '/login'],
      ['/en/drive', default_locale, '/drive'],
      ['/mr', 'mr', '/mr'],
      ['/sa', 'sa', '/sa'],
      ['/te', 'te', '/te'],
      ['/ml/drive', 'en', '/en/drive']
    ];
    for (let test_item of TEST_LIST)
      expect(get_link(test_item[0], test_item[1])).toBe(test_item[2]);
  });
});
