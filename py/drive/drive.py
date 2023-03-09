from fastapi import Depends
from .security import get_current_user, router, GRAPHQL_URL
from kry.datt import Drive, deta_val, Base
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
class FileInfoType:
    name: str
    """File name"""
    size: str
    """File size in bytes"""
    mime: str
    """File mime type"""
    date: str
    """File upload date"""
    key: str
    """File `hash_key`"""


def get_user_drive_name(info: Info) -> str:
    return f"{info.context.user}"


def get_user_base_name(info: Info) -> str:
    return f"{info.context.user}_files"


@strawberry.type
class Query:
    @strawberry.field
    async def fileList(info: Info) -> List[FileInfoType]:
        data = Base(f"{info.context.user}_files").fetch()
        if not data or data.count == 0:
            return []
        else:
            return [FileInfoType(**x) for x in data.items]

    @strawberry.field
    async def downloadID() -> str:
        return to_base64(deta_val("drive_key", "keys"))

    @strawberry.field
    async def uploadID() -> str:
        return to_base64(deta_val("drive_key", "keys"))


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def deleteFiles(self, fileHashes: List[str], info: Info) -> DeleteInfo:
        DRIVE_NAME = get_user_drive_name(info)
        BASE_NAME = get_user_base_name(info)
        base = Base(BASE_NAME)
        # Delete from Database
        for fileHash in fileHashes:
            base.delete(fileHash)
        # Delete from File Drive
        res = Drive(DRIVE_NAME).delete_many(fileHashes)
        for x in ["deleted", "failed"]:
            if x not in res:
                res[x] = []
        return DeleteInfo(**res)

    @strawberry.mutation
    async def uploadFile(
        self, name: str, size: str, mime: str, date: str, key: str, info: Info
    ) -> None:
        BASE_NAME = get_user_base_name(info)
        Base(BASE_NAME).put(dict(name=name, size=size, mime=mime, date=date), key)

    @strawberry.mutation
    async def renameFile(self, name: str, key: str, info: Info) -> None:
        BASE_NAME = get_user_base_name(info)
        base = Base(BASE_NAME)
        data = base.get(key)
        data["name"] = name
        base.put(data)

    @strawberry.mutation
    async def moveFiles(self, names: List[str], keys: List[str], info: Info) -> None:
        BASE_NAME = get_user_base_name(info)
        base = Base(BASE_NAME)
        for name, key in zip(names, keys):
            data = base.get(key)
            data["name"] = name
            base.put(data)


class User(BaseContext):
    def __init__(self, user: str):
        self.user: str = user


async def get_context(username: str = Depends(get_current_user)) -> User:
    return User(user=username)


router.include_router(
    GraphQLRouter(
        strawberry.Schema(
            query=Query,
            mutation=Mutation,
        ),
        context_getter=get_context,
        allow_queries_via_get=False,
    ),
    prefix=GRAPHQL_URL,
)
router.include_router(api_router)
