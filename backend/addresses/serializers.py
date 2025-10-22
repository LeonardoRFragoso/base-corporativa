from rest_framework import serializers
from .models import Address


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            'id', 'first_name', 'last_name', 'phone', 'street', 'number', 'complement',
            'neighborhood', 'city', 'state', 'zip_code', 'country', 'is_default',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
