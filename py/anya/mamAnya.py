from fastapi import APIRouter, Request, HTTPException, status
from kry.datt import deta_val, Base, ERR_MSG
from kry.prakara import KEY_REG, KEY
from kry.gupta import decrypt_text, puShTi, encrypt
from requests import get

router = APIRouter(prefix="")


def verify(key: str, verify_key: str):
    if not puShTi(key, deta_val(verify_key)):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, ERR_MSG)


@router.post("/env")
async def get_set_env(bd: KEY_REG):
    verify(bd.key, "env")
    if bd.reg != None:
        Base("keys").put([bd.reg], "env")
        return dict(detail="praphalitam")
    else:
        return deta_val("env", "keys")[0]


@router.post("/git_key")
@router.post("/deta_auth")
@router.post("/deta_key")
async def get_deta_key(bd: KEY, req: Request, encrypt_key: str = None):
    nm = req.url.path.split("/")[-1]
    verify(bd.key, nm)
    val = decrypt_text(deta_val(nm, "keys"), bd.key)
    if encrypt_key:
        val = encrypt(val, encrypt_key).decode("utf-8")
    return dict(value=val)


@router.post("/track_info")
async def root_POST(bd: KEY):
    verify(bd.key, "track")
    r = get(
        "https://api.github.com/repos/lipilekhika/dist/releases",
        headers={"User-Agent": "Mozilla/5.0"},
    ).json()
    res = {}
    bhsh = deta_val("display_list", "keys")[0]
    for x in r:
        n = x["tag_name"]
        res[n] = {"name": x["name"], "info": {}}
        for y in x["assets"]:
            v = y["name"].split(".")[0]
            if "bhasha" in n:
                v = bhsh[v]
            elif v == "su":
                v = "परिगणना"
            res[n]["info"][v] = y["download_count"]
    return res
