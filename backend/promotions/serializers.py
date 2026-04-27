from rest_framework import serializers
from .models import FlashSale


class FlashSaleSerializer(serializers.ModelSerializer):
    time_remaining = serializers.SerializerMethodField()
    is_live = serializers.SerializerMethodField()
    
    class Meta:
        model = FlashSale
        fields = [
            'id',
            'name',
            'description',
            'discount_percentage',
            'start_time',
            'end_time',
            'max_quantity',
            'current_sold',
            'is_active',
            'banner_image',
            'is_live',
            'time_remaining'
        ]
    
    def get_is_live(self, obj):
        return obj.is_live()
    
    def get_time_remaining(self, obj):
        return obj.time_remaining()
