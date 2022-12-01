from kry.gupta import puShTi
from kry.datt import deta_val, ERR_MSG
from fastapi import HTTPException, status


def verify(key: str, verify_key: str):
    if not puShTi(key, deta_val(verify_key)):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, ERR_MSG)
