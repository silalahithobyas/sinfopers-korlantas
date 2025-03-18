from rest_framework.views import exception_handler
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
        custom_response = {
            "success": False,
            "message": exc.detail if hasattr(exc, 'detail') else 'An error occurred',
            "data": None
        }

        if(isinstance(exc.detail, dict)) :
            message = exc.detail.get('detail')
            custom_response['message'] = message if message else 'An error occurred'
            
        response.data = custom_response

    return response