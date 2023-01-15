import shubhlipi as sh, re, os
from langs.datt import LANG_DB
from typing import Dict

if sh.args(0) == "clone":
    sh.delete_folder("o")
    NAME = "sanchika"
    sh.cmd(f"deta clone --name {NAME} --project sandesh")
    os.rename(NAME, "o")
    exit()
repl = {}
for x in os.listdir("o"):  # Clearing the directory
    if x in [".deta"]:
        continue
    sh.delete(f"o/{x}")


def make_requirements_txt():
    sh.cmd("pipenv requirements --exclude-markers > o/requirements.txt", display=False)
    fl = sh.read("o/requirements.txt")
    fl = fl.replace("-i https://pypi.org/simple\n", "")
    sh.write("o/requirements.txt", fl)


make_requirements_txt()


def copy_files(lc=""):
    sh.makedir(f"o/{lc}")
    for y in os.listdir(f"./{lc}"):
        x = f"{lc}/{y}" if lc != "" else y
        if x in [  # ignore these files
            ".env",
            "o",
            "karah.py",
            ".venv",
            "Pipfile",
            "Pipfile.lock",
            "langs/data",
            "langs/r.json",
            "langs/anuvad.py",
        ] or y in ["__pycache__", "a.py", ".gitignore"]:
            continue
        elif os.path.isdir(x):
            copy_files(x)
            continue
        elif x in repl or x.split(".")[-1] == "py":
            f = sh.read(x)
            if x in repl:
                for st in repl[x]:
                    f = f.replace(st, repl[x][st])
            if True:  # Removes Blank Lines
                f = re.sub(r"(?<=\n)\s*\n", "", f)
            sh.write(f"o/{x if x!='app.py' else 'main.py'}", f)
        else:
            sh.copy_file(x, f"o/{x}")


def make_lang_files():
    sh.makedir("o/langs/data")
    LANG_DB.json_type = True
    for x in sh.lang_list:
        code = sh.lang_list[x]
        data: Dict = LANG_DB(code)
        sh.write(f"o/langs/data/{sh.lang_list[x]}.json", sh.dump_json(data))


copy_files()
make_lang_files()

if "deploy" in sh.argv:
    if "nobuild" not in sh.argv:
        sh.start_thread(
            lambda: print(
                f"\n\tBeautified with prettier :",
                "Success" if sh.cmd("pnpm format", display=False)[0] == 0 else "Failed",
            )
        )
        sh.cmd("pnpm build", direct=False)
    sh.copy_folder("../build", "o/public")
    print("\nCopied SvelteKit 'build' folder to FastAPI 'public' folder")
    sh.cmd("cd o && deta deploy", direct=False)
if "test" in sh.argv:
    # Testing After every deploy
    req = sh.get(
        f'{sh.load_json(sh.cmd("cd o && deta details", display=False)[1])["endpoint"]}/api/encrypt',
        params={"key": "test", "value": "Testing..."},
    )
    print("\nStatus Code:", req.status_code)
    # print("Headers:-")
    # print(sh.dump_json(dict(req.headers)))
    print("Content:-")
    print(req.content)
