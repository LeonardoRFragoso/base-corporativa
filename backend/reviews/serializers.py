from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)
    user_email = serializers.SerializerMethodField(read_only=True)
    product_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Review
        fields = (
            'id', 'product', 'product_name', 'user', 'user_name', 'user_email', 
            'rating', 'title', 'comment', 'approved', 'admin_response',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def get_user_name(self, obj):
        return getattr(obj.user, 'username', None) or 'Anônimo'
    
    def get_user_email(self, obj):
        return getattr(obj.user, 'email', None)
    
    def get_product_name(self, obj):
        return obj.product.name if obj.product else None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)


class ReviewModerationSerializer(serializers.ModelSerializer):
    """Serializer específico para moderação de reviews por admins"""
    class Meta:
        model = Review
        fields = ('approved', 'admin_response')
    
    def update(self, instance, validated_data):
        instance.approved = validated_data.get('approved', instance.approved)
        instance.admin_response = validated_data.get('admin_response', instance.admin_response)
        instance.save()
        return instance
