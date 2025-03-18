from authentication.models import AuthUser
from rest_framework.authentication import BaseAuthentication

from commons.middlewares.exception import NotFoundException

class UserAuthentication(BaseAuthentication):

    """
    This allows authentication
    with either a phone_number or email.
    """

    def authenticate(self, **kwargs):
        username = kwargs.pop('username')
        password = kwargs.pop('password')
        user = AuthUser.objects.filter(username=username).first()
        if(not user) :
            raise NotFoundException("User not exists.")

        if user.check_password(password):
            return user

user_model = UserAuthentication()
