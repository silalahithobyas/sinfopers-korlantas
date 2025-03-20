from rest_framework import status
from typing import Optional, Union
from pydantic import BaseModel

from rest_framework.exceptions import APIException
from django.utils.functional import Promise

class APIErrorData(BaseModel) :
    detail: Union[str, Promise]
    code: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True

class ExtendedAPIException(APIException) :
    def __init__(self, detail=None, code=None):
        if isinstance(detail, APIErrorData) :
            super().__init__(detail=(detail.detail), code=detail.code)
            return
        super().__init__((detail), code)


class BadRequestException(ExtendedAPIException) :
    status_code = status.HTTP_400_BAD_REQUEST

class NotFoundException(ExtendedAPIException) :
    status_code = status.HTTP_404_NOT_FOUND

class AuthenticationException(ExtendedAPIException) :
    status_code = status.HTTP_401_UNAUTHORIZED
