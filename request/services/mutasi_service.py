from ..models.mutasi import MutasiRequest

class MutasiService:
    @staticmethod
    def create_mutasi(user, validated_data):
        return MutasiRequest.objects.create(
            user=user,
            status="dikirim",
            **validated_data
        )