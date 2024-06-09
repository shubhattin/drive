import type { PageServerLoad } from './$types';
import load_data, { get_locale } from '@langs/datt.server';

export const load: PageServerLoad = ({ params }) => {
  const locale = get_locale(params.lang!);
  return {
    locale: locale,
    lekh: load_data(locale)?.drive.login!
  };
};
