from pydantic.dataclasses import dataclass

@dataclass
class AddNewUser():
    success_detail: str
    user_already_exist: str
    wrong_main_pass: str

@dataclass
class Reset():
    success_detail: str
    user_not_found: str
    wrong_current_pass: str

@dataclass
class DriveApi():
    add_new_user: AddNewUser
    reset: Reset

@dataclass
class DriveSecurity():
    expired_credentials: str
    user_not_found: str
    wrong_credentials: str
    wrong_pass: str

@dataclass
class LangDBModel():
    drive_api: DriveApi
    drive_security: DriveSecurity
