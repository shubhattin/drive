import shubhlipi as sh, re, os
from importlib.metadata import version
from kry.lang import LANG_DB, DEFAULT_LOCALE

if sh.args(0) == "clone":
    sh.delete_folder("o")
    NAME = "sanchika"
    sh.cmd(f"deta clone --name {NAME} --project sandesh")
    os.rename(NAME, "o")
    exit()
packages = [
    "fastapi",
    "requests",
    "deta",
    "bcrypt",
    "cryptography",
    "python-multipart",
    "python-jose[cryptography]",
    "strawberry-graphql[fastapi]",
]
if sh.args(0) == "update":
    sh.cmd(f'pip install --upgrade {" ".join(packages)}', file=True)
    exit()
repl = {
    "kry/lang.py": {
        r"LOCALES = []": f"LOCALES = {list(sh.lang_list.values())}",
    },
}
for x in os.listdir("o"):  # Clearing the directory
    if x in [".deta", "requirements.txt"]:
        continue
    sh.delete(f"o/{x}")
req = []  # requirements -> version
for x in packages:
    x = re.sub(r"\[.+?\]", "", x)
    req.append(f"{x}=={version(x)}")
sh.write("o/requirements.txt", "\n".join(req))


def copy_files(lc=""):
    sh.makedir(f"o/{lc}")
    for y in os.listdir(f"./{lc}"):
        x = f"{lc}/{y}" if lc != "" else y
        if x in [".env", "o", "karah.py", ".venv", "Pipfile", "Pipfile.lock"] or y in [
            "__pycache__",
            "a.py",
        ]:
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
            if True:  # Other Production based removals
                f = sh.remove_in_between(f, r"r_start", r"r_end")
                f = sh.remove_line_with_tag(f, r"r_remove")
                regex = re.compile(r"# .+ # r_remove_comment")
                ind_change = 0
                for mt in regex.finditer(f):
                    i = (mt.start() + ind_change, mt.end() + ind_change)
                    st = f[i[0] : i[1]][2:][:-19]
                    ind_change += len(st) - (i[1] - i[0])
                    f = f[: i[0]] + st + f[i[1] :]
            if x == "kry/lang.py":
                LANG_DB.json_type = True
                LANG_DB(DEFAULT_LOCALE)
                DB = LANG_DB.data
                f = f.replace("RAW_JSON_DB = {}", f"RAW_JSON_DB = {DB}")
            sh.write(f"o/{x if x!='app.py' else 'main.py'}", f)
        else:
            sh.copy_file(x, f"o/{x}")


copy_files()

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
    print("\nCopied Nextjs 'build' folder to FastAPI 'public' folder")
    sh.cmd("cd o\ndeta deploy", file=True)
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
