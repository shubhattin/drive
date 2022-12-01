from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from kry.datt import deta_val, Base
from kry.gupta import bin_str, puShTi
from kry.lang import LANG_DB
from kry.plugins import get_locale
from .security import USERS_DB
import bcrypt

router = APIRouter(prefix="/api/drive")


class ResetBody(BaseModel):
    id: str
    currentPass: str
    newPass: str


@router.post("/reset")
async def reset_pass(bdy: ResetBody, locale: str = Depends(get_locale)):
    lekh = LANG_DB(locale).drive_api.reset
    user_pass = deta_val(bdy.id, USERS_DB)
    if not user_pass:
        raise HTTPException(401, lekh.user_not_found)
    if not bcrypt.checkpw(bin_str(bdy.currentPass), bin_str(user_pass)):
        raise HTTPException(401, lekh.wrong_current_pass)
    Base(USERS_DB).put(
        bcrypt.hashpw(bin_str(bdy.newPass), bcrypt.gensalt()).decode("ascii"), bdy.id
    )
    return dict(detail=lekh.success_detail)


class NewUserBody(BaseModel):
    username: str
    password: str
    mukhya: str


@router.post("/add_new_user")
async def reset_pass(bdy: NewUserBody, locale: str = Depends(get_locale)):
    lekh = LANG_DB(locale).drive_api.add_new_user
    if deta_val(bdy.username, USERS_DB):
        raise HTTPException(401, lekh.user_already_exist)
    if not puShTi(bdy.mukhya, deta_val("drive_auth")):
        raise HTTPException(401, lekh.wrong_main_pass)
    Base(USERS_DB).put(
        bcrypt.hashpw(bin_str(bdy.password), bcrypt.gensalt()).decode("ascii"),
        bdy.username,
    )
    return dict(detail=lekh.success_detail)
