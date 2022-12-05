from fastapi import APIRouter, HTTPException, status
from kry.gupta import encrypt, decrypt_text
from kry.datt import ERR_MSG
import cryptography
from .mamAnya import router as mamaRouter

router = APIRouter(prefix="/api")
router.include_router(mamaRouter)

@router.get("/encrypt")
async def encrypt_api_get(value: str, key: str):
    return dict(value=encrypt(value, key))


@router.get("/decrypt")
async def decrypt_api_get(value: str, key: str):
    try:
        return dict(value=decrypt_text(value, key))
    except cryptography.fernet.InvalidToken:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, ERR_MSG)
