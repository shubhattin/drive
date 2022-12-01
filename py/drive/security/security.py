from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Union, Optional
from kry.datt import deta_val
from kry.gupta import bin_str
from kry.plugins import get_locale
from jose import JWTError, jwt, ExpiredSignatureError
from time import time
import bcrypt, os
from kry.plugins import get_locale
from kry.lang import LANG_DB

router = APIRouter(prefix="")
USERS_DB = "drive_users"  # Hashed Password of users
TOKEN_URL = "/drive/login"
TOKEN_URL_PREFIX = "/".join(TOKEN_URL.split("/")[:-1])
JWT_KEY = os.getenv("JWT_KEY")
ALGORITHM = "HS256"
GRAPHQL_URL = "/api/drive"
# $ openssl rand -hex 32

def create_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_KEY, algorithm=ALGORITHM)
    return encoded_jwt


ID_EXPIRE = timedelta(days=5)
ACCESS_EXPIRE = timedelta(hours=8)
ID_EXPIRE_SECS = int(ID_EXPIRE.total_seconds())
ACCESS_EXPIRE_SECS = int(ACCESS_EXPIRE.total_seconds())


def pratyapattra_kArakam(user: str):
    id_token = create_token(dict(sub=user, type="login"), ID_EXPIRE)
    access_token = create_token(
        dict(sub=user, type="api", access="drive"), ACCESS_EXPIRE
    )
    return {
        "id_token": id_token,
        "id_token_expire": ID_EXPIRE_SECS,
        "access_token": access_token,
        "access_token_expire": ACCESS_EXPIRE_SECS,
        "token_type": "bearer",
    }


LOGIN_EXCEPTION = lambda msg: HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail=msg,
    headers={"WWW-Authenticate": "Bearer"},
)


@router.post(TOKEN_URL)
async def login_for_access_token(
    form: OAuth2PasswordRequestForm = Depends(), locale: str = Depends(get_locale)
):
    lekh = LANG_DB(locale).drive_security
    inf = [form.username, None]
    inf[1] = deta_val(inf[0], USERS_DB)
    if not inf[1]:
        raise LOGIN_EXCEPTION(lekh.user_not_found)
    elif not bcrypt.checkpw(bin_str(form.password), bin_str(inf[1])):
        raise LOGIN_EXCEPTION(lekh.wrong_pass)
    return pratyapattra_kArakam(inf[0])


class OAuth2GudhapadBearer(OAuth2PasswordBearer):
    """Custom `Outh2` Bearer to also allow `GraphQl UI`"""

    async def __call__(self, request: Request) -> Optional[str]:
        type = request.method
        url = request.url.path
        if type == "GET" and url == GRAPHQL_URL:
            return "graphql_ui"
        # r_start
        if type == "POST":
            js = await request.json()
            nm = "operationName"
            if nm in js and js[nm] == "IntrospectionQuery":
                return "graphql_ui"
        # r_end
        return await super().__call__(request)


oauth2_scheme = OAuth2GudhapadBearer(tokenUrl=TOKEN_URL)


async def get_current_user(
    token: str = Depends(oauth2_scheme), locale: str = Depends(get_locale)
) -> str:
    # Verifying the Acces Token Here
    lekh = LANG_DB(locale).drive_security
    CREDENTIAL_EXCEPTION = LOGIN_EXCEPTION(lekh.wrong_credentials)
    if token == "graphql_ui":
        # r_start
        return "user"
        # r_end
        raise HTTPException(404, "Not Found")
    if not token:
        raise CREDENTIAL_EXCEPTION
    try:
        payload = jwt.decode(token, JWT_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        type: str = payload.get("type")
        access: str = payload.get("access")
        if None in [username, type] or type != "api" or access != "drive":
            raise CREDENTIAL_EXCEPTION
    except ExpiredSignatureError:
        raise HTTPException(status.HTTP_410_GONE, lekh.expired_credentials)
    except JWTError:
        raise CREDENTIAL_EXCEPTION
    return username


class praviShTa_puShTi:
    def __init__(self, refresh=False):
        self.refresh = refresh

    async def __call__(self, req: Request):
        # Verifying the ID Token Here
        token = req.cookies.get("drive_auth_id")
        if not token:
            return None
        try:
            payload = jwt.decode(token, JWT_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            type: str = payload.get("type")
            if (
                self.refresh
                and time() - payload.get("exp") + ID_EXPIRE_SECS < ACCESS_EXPIRE_SECS
            ):
                return None
            if None in [username, type] or type != "login":
                return None
        except JWTError:
            return None
        return username


@router.post(TOKEN_URL + "_navIkaraNam")
async def renew_acces_token(
    user: str = Depends(praviShTa_puShTi(True)), locale: str = Depends(get_locale)
):
    lekh = LANG_DB(locale).drive_security
    CREDENTIAL_EXCEPTION = LOGIN_EXCEPTION(lekh.wrong_credentials)
    if not user:
        raise CREDENTIAL_EXCEPTION
    return pratyapattra_kArakam(user)
