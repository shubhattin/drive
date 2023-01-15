from typing import Dict
from .lang_data_model import LangDBModel
from kry.datt import DEV_ENV, PROD_ENV, read_file
import json

LOCALE_DATA = json.loads(read_file("langs/locales.json"))

LOCALES = list(LOCALE_DATA["locales"].keys())
DEFAULT_LOCALE = LOCALE_DATA["default_locale"]


class भाषादत्तांश:
    def __init__(self):
        self.data: Dict[str, LangDBModel] = {}
        self.__loaded: Dict[str, bool] = {}
        self.json_type = False

    def __load(self, locale: str):
        if self.__loaded.get(locale, False):
            return

        locale_name = LOCALE_DATA["locales"][locale]
        if DEV_ENV:
            import yaml

            data: Dict = yaml.safe_load(read_file(f"langs/data/{locale_name}.yaml"))
        else:
            # for some reason unicode named files are not working in deta server
            # so using this
            data: Dict = json.loads(read_file(f"langs/data/{locale}.json"))
        dt = self.__reuse(data)
        self.data[locale] = dt
        if PROD_ENV:
            self.__loaded[locale] = True

    def __reuse(self, db: Dict) -> LangDBModel:
        dt = LangDBModel(**db)
        if PROD_ENV:
            return dt
        import shubhlipi as sh

        MAP = [
            [dt.drive_api.reset.user_not_found, ["dt.drive_security.user_not_found"]]
        ]
        for x in MAP:
            for y in x[1]:
                sh.set_val_from_address("/".join(y[2:].split(".")), db, x[0])
        return LangDBModel(**db) if not self.json_type else db

    def __call__(self, locale: str):
        self.__load(locale)
        return self.data[locale]


LANG_DB = भाषादत्तांश()
