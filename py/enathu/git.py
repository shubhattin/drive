from fastapi import APIRouter
from requests import get
from kry.datt import deta_val
from kry.prakara import KEY
from .securtiy import verify

router = APIRouter(prefix="")

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
