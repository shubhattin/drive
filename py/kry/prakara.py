from pydantic import BaseModel
from typing import Optional


def Detail(x):
    return {"detail": x}


def Value(x):
    return {"value": x}


class KEY(BaseModel):
    key: str


class KEY_REG(KEY):
    reg: Optional[dict] = None


class KEY_PASS(KEY):
    id: str


class KEY_PASS_NAME(KEY_PASS):
    name: str


class KEY_OLD(BaseModel):
    old: str
    new: str
    id: str


class KEY_NEW(KEY):
    main_key: str
    id: str
