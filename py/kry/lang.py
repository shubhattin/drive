from typing import Dict
from .lang_data_model import LangDBModel

LOCALES = []
DEFAULT_LOCALE = "sa"

# r_start
import shubhlipi as sh

LOCALES = list(sh.lang_list.values())
LOCALE_NAMES = list(sh.lang_list.keys())
# r_end


class भाषादत्तांश:
    def __init__(self):
        self.data: Dict[str, LangDBModel] = {}
        self.__loaded = False
        self.json_type = False

    def __load(self):
        # r_start
        import yaml

        for x in LOCALE_NAMES:
            dt = self.__reuse(
                yaml.safe_load(
                    open(f"../src/langs/data/{x}.yaml", encoding="utf-8", mode="r")
                )["server"]
            )
            self.data[LOCALES[LOCALE_NAMES.index(x)]] = dt
        return
        # r_end
        RAW_JSON_DB = {}
        for x in LOCALES:
            self.data[x] = LangDBModel(**RAW_JSON_DB[x])
        self.__loaded = True

    # r_start
    def __reuse(self, db):
        dt = LangDBModel(**db)
        MAP = [
            [dt.drive_api.reset.user_not_found, ["dt.drive_security.user_not_found"]]
        ]
        for x in MAP:
            for y in x[1]:
                sh.set_val_from_address("/".join(y[2:].split(".")), db, x[0])
        if self.json_type:
            return db
        return LangDBModel(**db)

    # r_end

    def __call__(self, locale: str):
        if not self.__loaded:
            self.__load()
        return self.data[locale]


LANG_DB = भाषादत्तांश()
