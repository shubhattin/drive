from fastapi import FastAPI, Request
from fastapi.responses import Response
from kry.plugins import sthaitik_sanchit
import anya, drive  # Routes
from datetime import timedelta
from kry.datt import DEV_ENV, PROD_ENV

APP_NAME = "शुभलिपिलघूपकरणम्"
if DEV_ENV:
    app = FastAPI(debug=True, title=APP_NAME)
else:
    app = FastAPI(openapi_url=None, redoc_url=None, title=APP_NAME)


CACHE_DURATION = int(timedelta(weeks=1).total_seconds())


@app.middleware("http")
async def middleware(req: Request, call_next):
    res: Response = await call_next(req)
    head = {"X-sraShTA": "bhagavatprasAdAt"}
    if req.method == "GET":
        head.update(
            {
                "X-Robots-Tag": "noindex",
                "X-Frame-Options": "deny",
                "Cache-Control": "No-Store"
                if DEV_ENV
                else f"public, max-age={CACHE_DURATION}",
            }
        )
    for x in head:
        res.headers[x] = head[x]
    for x in ["X-Powered-By"]:
        if x in res.headers:
            del res.headers[x]
    return res


for route in [drive, anya]:
    app.include_router(route.router)

if PROD_ENV:
    app.mount("/", sthaitik_sanchit(directory="public"), name="static")

if DEV_ENV:
    import uvicorn

    if __name__ == "__main__":
        uvicorn.run("app:app", host="0.0.0.0", port=3428, reload=True)
