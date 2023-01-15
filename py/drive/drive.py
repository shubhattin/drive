from fastapi import Depends
from .security import get_current_user, router, GRAPHQL_URL
from kry.datt import Drive, deta_val
from kry.gupta import to_base64
from strawberry.fastapi import GraphQLRouter, BaseContext
from strawberry.types import Info
import strawberry
from typing import List
from .api import router as api_router


@strawberry.type
class DeleteInfo:
    deleted: List[str]
    failed: List[str]


@strawberry.type
class Query:
    @strawberry.field
    async def fileList(info: Info) -> List[str]:
        return Drive(info.context.user).list()["names"]

    @strawberry.field
    async def deleteFiles(files: List[str], info: Info) -> DeleteInfo:
        res = Drive(info.context.user).delete_many(files)
        for x in ["deleted", "failed"]:
            if x not in res:
                res[x] = []
        return DeleteInfo(**res)

    @strawberry.field
    async def downloadID() -> str:
        return to_base64(deta_val("drive_key", "keys"))

    @strawberry.field
    async def uploadID() -> str:
        return to_base64(deta_val("drive_key", "keys"))


class User(BaseContext):
    def __init__(self, user: str):
        self.user: str = user


async def get_context(username: str = Depends(get_current_user)) -> User:
    return User(user=username)


router.include_router(
    GraphQLRouter(
        strawberry.Schema(Query),
        context_getter=get_context,
        allow_queries_via_get=False,
    ),
    prefix=GRAPHQL_URL,
)
router.include_router(api_router)
