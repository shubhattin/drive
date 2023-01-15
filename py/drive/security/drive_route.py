from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse, RedirectResponse, FileResponse
from . import TOKEN_URL, TOKEN_URL_PREFIX, praviShTa_puShTi
from langs.datt import LOCALES
from kry.datt import DEV_ENV

router = APIRouter(prefix="", default_response_class=HTMLResponse)


@router.get(TOKEN_URL_PREFIX)
@router.get(TOKEN_URL)
async def handle_drive_req(req: Request, user: str = Depends(praviShTa_puShTi())):
    URL = req.url.path
    lst = URL.split("/")
    LOCALE_PREFIX = ""
    if lst[1] in LOCALES:
        LOCALE_PREFIX = f"/{lst[1]}"
    IS_LOGIN_PAGE = URL.endswith(TOKEN_URL)
    if not user and not IS_LOGIN_PAGE:
        return RedirectResponse(LOCALE_PREFIX + TOKEN_URL)
    elif IS_LOGIN_PAGE and user:
        return RedirectResponse(LOCALE_PREFIX + TOKEN_URL_PREFIX)
    if DEV_ENV:
        from requests import get

        return get(f"http://localhost:3427{URL}").content.decode("utf-8")
    return FileResponse(f"public{URL}.html")


@router.get("/")
def redirect_home_page(req: Request):
    URL = req.url.path
    lst = URL.split("/")
    LOCALE_PREFIX = ""
    if lst[1] in LOCALES:
        LOCALE_PREFIX = f"/{lst[1]}"
    return RedirectResponse(LOCALE_PREFIX + "/drive")


bhasha_router = APIRouter(prefix="", default_response_class=HTMLResponse)
for x in LOCALES:
    bhasha_router.include_router(router, prefix=f"/{x}")
router.include_router(bhasha_router)
