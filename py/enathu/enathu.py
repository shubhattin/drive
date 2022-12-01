from fastapi import APIRouter, HTTPException, status
from kry.datt import deta_val, deta, ERR_MSG
from kry.prakara import KEY_REG, Detail, Value
from kry.gupta import encrypt, decrypt_text
from .git import router as gitRouter
from .keys import router as keysEouter
import cryptography
from .securtiy import verify

router = APIRouter(prefix="/api")
for rtr in [gitRouter, keysEouter]:
    router.include_router(rtr)


@router.post("/env")
async def get_set_env(bd: KEY_REG):
    verify(bd.key, "env")
    if bd.reg != None:
        deta.Base("keys").put([bd.reg], "env")
        return Detail("praphalitam")
    else:
        return deta_val("env", "keys")[0]


@router.get("/encrypt")
async def encrypt_api_get(value: str, key: str):
    return Value(encrypt(value, key))


@router.get("/decrypt")
async def decrypt_api_get(value: str, key: str):
    try:
        return Value(decrypt_text(value, key))
    except cryptography.fernet.InvalidToken:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, ERR_MSG)
