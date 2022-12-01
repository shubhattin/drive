from starlette.types import Receive, Scope, Send
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi import Request
from .lang import LOCALES, DEFAULT_LOCALE
import os


class sthaitik_sanchit(StaticFiles):
    """
    `स्थैतिकसञ्चितप्रदत्ता` : Static File Router, with `Cloudfare` like HTML Serving
    """

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        """
        The ASGI entry point.
        """
        assert scope["type"] == "http"

        if not self.config_checked:
            await self.check_config()
            self.config_checked = True

        path = scope["path"]
        nm = path.split("/")[-1]
        pth = f"{self.directory}/{path}"
        if path == "/":
            response = FileResponse(f"{self.directory}/index.html")
        elif path == "/index.html":
            response = RedirectResponse("/")
        elif os.path.isfile(f"{pth}.html"):
            response = FileResponse(f"{pth}.html")
        elif path.split(".")[-1] == "html" and os.path.isfile(pth):
            response = RedirectResponse(path[:-5])
        elif nm == "" and path[-1] == "/" and os.path.isfile(f"{pth[:-1]}.html"):
            response = RedirectResponse("/".join(path.split("/")[:-1]))
        else:
            self.html = True
            response = await self.get_response(self.get_path(scope), scope)
        await response(scope, receive, send)


async def get_locale(req: Request):
    """`FastAPI` dependency to get the current locale"""
    header: str = req.headers.get("X-bhAShA") or req.headers.get("Accept-Language")
    if not header:
        return DEFAULT_LOCALE
    try:
        languages = header.split(",")
        locale_q_pairs = []
        for language in languages:
            if language.split(";")[0] == language:
                ln = language.strip().lower().split("-")
                locale_q_pairs.append((ln[0], ln[1] if len(ln) == 2 else "", 1.0))
            else:
                locale = language.split(";")[0].strip()
                q = language.split(";")[1].split("=")[1]
                ln = locale.lower().split("-")
                locale_q_pairs.append((ln[0], ln[1] if len(ln) == 2 else "", float(q)))
        for x in locale_q_pairs:
            if x[0] in LOCALES:
                return x[0]
    except:
        return DEFAULT_LOCALE
