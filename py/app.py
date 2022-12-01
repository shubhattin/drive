from fastapi import FastAPI, Request
from fastapi.responses import Response
from kry.plugins import sthaitik_sanchit
import enathu, drive  # Routes

app = FastAPI(
    debug=True, # r_remove
    # openapi_url=None, # r_remove_comment
    # redoc_url=None, # r_remove_comment
    title="शुभलिपिलघूपकरणम्",
)


@app.middleware("http")
async def middleware(req: Request, call_next):
    res: Response = await call_next(req)
    head = {"X-sraShTA": "bhagavatprasAdAt"}
    if req.method == "GET":
        head.update(
            {
                "X-Robots-Tag": "noindex",
                "X-Frame-Options": "deny",
                "Cache-Control": "No-Store", # r_remove
                # "Cache-Control": "public, max-age=10800" # 3 hours # r_remove_comment
            }
        )
    for x in head:
        res.headers[x] = head[x]
    for x in ["X-Powered-By"]:
        if x in res.headers:
            del res.headers[x]
    return res


for route in [drive, enathu]:
    app.include_router(route.router)

# app.mount("/", sthaitik_sanchit(directory="public"), name="static") # r_remove_comment

# r_start
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=3428, reload=True)
# r_end
