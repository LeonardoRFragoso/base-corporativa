from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Review
        fields = (
            'id', 'product', 'user', 'user_name', 'rating', 'title', 'comment', 'created_at'
        )
        read_only_fields = ('id', 'user', 'created_at')

    def get_user_name(self, obj):
        return getattr(obj.user, 'username', None)

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)
