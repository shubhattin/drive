import os, json
from deta import Deta

DEV_ENV: bool = (
    (os.getenv("DETA_SPACE_APP") and os.getenv("DETA_SPACE_APP") != "true")
    or (os.getenv("VIRTUAL_ENV") is not None)
    or (os.getenv("PIPENV_ACTIVE") and os.getenv("PIPENV_ACTIVE") == "1")
)
PROD_ENV: bool = not DEV_ENV
DEV_ENV = not PROD_ENV

if DEV_ENV:
    from .gupta import from_base64
    import dotenv

    dotenv.load_dotenv()

    deta = Deta(from_base64(os.getenv("DETA_KEY")))
else:
    deta = Deta()

Drive = deta.Drive
Base = deta.Base


def read_file(file: str):
    fl = open(file, encoding="utf-8", mode="r")
    val = fl.read()
    fl.close()
    return val


def deta_val(key: str, root="verify", jsn=False):
    if key == "":
        return None
    v = deta.Base(root).get(key)
    if v == None:
        v = None
    else:
        v = v["value"]
    if jsn:
        v = json.loads(v)
    return v


ERR_MSG = "anuchitaM kIlakam!"


class LoadData:
    """Loads all types of values from `DetaBase`"""

    def __init__(self, key: str, root: str):
        self.__loaded: bool = False
        self.__data = None
        self.__key = key
        self.__root = root

    def __load(self):
        if self.__loaded:
            return
        self.__data = deta_val(self.__key, self.__root)
        self.__loaded = True

    def __call__(self):
        return self.get()

    def get(self):
        """Get value"""
        self.__load()
        return self.__data


class LoadListJSON(LoadData):
    """Loads `json` stored in a `list` from `DetaBase`"""

    def __getitem__(self, key: str):
        return self.get()[key]

    def get(self) -> dict:
        """Get raw `JSON`"""
        return super().get()[0]
