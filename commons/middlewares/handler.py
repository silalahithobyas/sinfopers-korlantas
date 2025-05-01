from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Custom exception handler untuk REST Framework.
    """
    # Panggil handler default dulu
    response = exception_handler(exc, context)

    # Jika response adalah None, berarti exception tidak ditangani oleh DRF
    if response is None:
        return Response(
            {
                "success": False,
                "message": str(exc),
                "data": None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Jika response sudah ada, tambahkan format success, message, data
    return Response(
        {
            "success": False,
            "message": str(exc),
            "data": response.data if hasattr(response, 'data') else None
        },
        status=response.status_code
    )