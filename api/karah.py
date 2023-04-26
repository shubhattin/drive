import shubhlipi as sh
from typing import Dict
import os

for x in sh.argv:
    if x == "requirements.txt":
        sh.cmd(
            "pipenv requirements --exclude-markers > requirements.txt", display=False
        )
        fl = sh.read("requirements.txt")
        fl = fl.replace("-i https://pypi.org/simple\n", "")
        sh.write("requirements.txt", fl)
    elif x == "build":
        from langs.datt import LANG_DB

        LANG_DB.json_type = True
        if os.path.isdir("./langs/data/json"):
            sh.delete_folder("./langs/data/json")
        sh.makedir("./langs/data/json")
        for x in sh.lang_list:
            code = sh.lang_list[x]
            data: Dict = LANG_DB(code)
            sh.write(f"./langs/data/json/{sh.lang_list[x]}.json", sh.dump_json(data))

        sh.cmd("pnpm build", direct=False)
        sh.copy_folder("../build", "public")
        print("\nCopied SvelteKit 'build' folder to FastAPI 'public' folder")
