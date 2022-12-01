from pydantic.dataclasses import dataclass

@dataclass
class Reset():
    user_not_found: str
    wrong_current_pass: str
    success_detail: str

@dataclass
class AddNewUser():
    user_already_exist: str
    wrong_main_pass: str
    success_detail: str

@dataclass
class DriveApi():
    reset: Reset
    add_new_user: AddNewUser

@dataclass
class DriveSecurity():
    user_not_found: str
    wrong_pass: str
    wrong_credentials: str
    expired_credentials: str

@dataclass
class LangDBModel():
    drive_api: DriveApi
    drive_security: DriveSecurity
