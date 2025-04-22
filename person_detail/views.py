# personnel_detail/views.py
import jwt
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from authentication.models.users import AuthUser
from personnel_database.models.users import UserPersonil
from rest_framework.decorators import api_view


def get_user_from_token(request):
    # Ambil header Authorization
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return JsonResponse({"error": "Authorization header missing or malformed"}, status=400)

    # Potong "Bearer " untuk mendapatkan token
    token = auth_header.split(' ', 1)[1]

    try:
        # Decode token
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get('user_id')
        if not user_id:
            return JsonResponse({"error": "Token payload missing user_id"}, status=400)

        # Dapatkan user dan data personil terkait
        user = get_object_or_404(AuthUser, id=user_id)
        personnel = get_object_or_404(UserPersonil, id=user_id)

        return JsonResponse({
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "role": user.role,
            },
            "personnel": {
                "id": str(personnel.id),
                "nama": personnel.nama,
                "nrp": personnel.nrp,
                "pangkat": personnel.pangkat.nama if personnel.pangkat else None,
                "jabatan": personnel.jabatan.nama if personnel.jabatan else None,
                "subsatker": personnel.subsatker.nama if personnel.subsatker else None,
                "subdit": personnel.subdit.nama if personnel.subdit else None,
                "status": personnel.status,
            }
        })

    except jwt.ExpiredSignatureError:
        return JsonResponse({"error": "Token expired"}, status=401)
    except jwt.DecodeError:
        return JsonResponse({"error": "Invalid token"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)