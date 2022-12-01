from fastapi import APIRouter, HTTPException, status, Request
from kry.datt import deta_val, ERR_MSG
from kry.prakara import KEY, Value
from kry.gupta import puShTi, decrypt_text
from .securtiy import verify

router = APIRouter(prefix="")


@router.post("/git_key")
@router.post("/deta_auth")
@router.post("/deta_key")
async def get_deta_key(bd: KEY, req: Request):
    nm = req.url.path.split("/")[-1]
    verify(bd.key, nm)
    return Value(decrypt_text(deta_val(nm, "keys"), bd.key))
