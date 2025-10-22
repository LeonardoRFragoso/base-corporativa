from rest_framework import serializers
from .models import DiscountCode


class DiscountCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCode
        fields = (
            'id', 'code', 'percent_off', 'amount_off', 'active',
            'valid_from', 'valid_until', 'usage_limit', 'times_used',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'times_used', 'created_at', 'updated_at')
