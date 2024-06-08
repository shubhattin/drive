"""
This module contains the code for translating text and generating model interface for ts

It reads the source language from the command line argument, loads the necessary data,
and performs the translation.

"""

#!/usr/bin/env python3
from time import time
import os
import sys
import json
import shubhlipi as sh
import yaml

LOCALES_JSON = sh.load_json(sh.read("locales.json"))
ln = sh.dict_rev(LOCALES_JSON["locales"])
ln2 = LOCALES_JSON["locales"]
if not os.path.isfile("r.json"):
    sh.write("r.json", sh.dump_json(dict(yes={}, no={}), 2))
if sh.args(0) in ln2:
    src = sh.args(0)
else:
    src = "en"
if input(f"Do you want to translate with {src} as base? ") != "yes":
    sys.exit()

DEFAULT_LOCALE = LOCALES_JSON["default_locale"]
sh.start_thread(lambda: sh.prettier_beautify("locales.json"))
main_db = yaml.safe_load(sh.read(f"data/{ln2[src]}.yaml"))
anu = {}
only = json.loads(sh.read("r.json"))
print(only)
for y, lng in ln.items():
    if lng == "en":
        continue
    tm = time()
    anu[y] = {}
    org = yaml.safe_load(sh.read(f"data/{y}.yaml"))
    if lng != "ur":
        anu[y] = sh.process_json(
            main_db,
            org,
            src,
            lng,
            no=only["no"],
            yes=only["yes"],
            only_org=lng in ("sa", "hi"),
        )
    else:
        anu[y] = sh.process_json(
            anu["हिन्दी"],
            org,
            "Hindi",
            "Urdu",
            no=only["no"],
            yes=only["yes"],
            func=sh.parivartak,
        )
    file_data = yaml.safe_dump(anu[y], allow_unicode=True, sort_keys=False)
    file_data = file_data.replace("''", "!!str")
    sh.write(f"data/{y}.yaml", file_data)
    print(lng, f"{time()-tm}s")

sh.start_thread(lambda: sh.prettier_beautify("data"))


def add_model():
    """Adding a model for TypeScript"""

    model = anu["संस्कृतम्"]
    TYPE_NAME = "dattType"
    STRUCT_NAME = "dattStruct"
    file = sh.generate_typescript_data_model(model, TYPE_NAME)
    file = (
        file.replace(f"export interface {TYPE_NAME}", f"export const {STRUCT_NAME} =")
        .replace(" string;", " '',")
        .replace("};", " },")
        + "\n"
    )
    file += "\n".join(
        [
            f"type {STRUCT_NAME}Type = typeof {STRUCT_NAME};",
            f"export interface {TYPE_NAME} extends {STRUCT_NAME}Type " + "{}",
        ]
    )
    sh.write("model.ts", file)
    sh.start_thread(lambda: sh.prettier_beautify("model.ts"))


add_model()
