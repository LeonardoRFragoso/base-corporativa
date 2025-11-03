from rest_framework import serializers
from .models import GiftCard, GiftCardDesign, GiftCardTransaction


class GiftCardDesignSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCardDesign
        fields = ['id', 'name', 'description', 'image', 'occasion']


class GiftCardSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = GiftCard
        fields = [
            'id', 'code', 'initial_value', 'current_balance',
            'recipient_email', 'recipient_name', 'message',
            'status', 'valid_from', 'valid_until', 'is_valid',
            'created_at'
        ]
        read_only_fields = ['code', 'status', 'created_at']
    
    def get_is_valid(self, obj):
        return obj.is_valid()


class GiftCardPurchaseSerializer(serializers.Serializer):
    """Serializer para compra de gift card"""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=10)
    recipient_email = serializers.EmailField()
    recipient_name = serializers.CharField(max_length=200)
    message = serializers.CharField(required=False, allow_blank=True)
    design_id = serializers.IntegerField(required=False)
    send_date = serializers.DateTimeField(required=False)
    
    def validate_amount(self, value):
        """Valida valor mínimo e máximo"""
        if value < 10:
            raise serializers.ValidationError('Valor mínimo é R$ 10,00')
        if value > 5000:
            raise serializers.ValidationError('Valor máximo é R$ 5.000,00')
        return value


class GiftCardBalanceSerializer(serializers.Serializer):
    """Serializer para consulta de saldo"""
    code = serializers.CharField(max_length=20)


class GiftCardApplySerializer(serializers.Serializer):
    """Serializer para aplicar gift card no checkout"""
    code = serializers.CharField(max_length=20)
    order_total = serializers.DecimalField(max_digits=10, decimal_places=2)


class GiftCardTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCardTransaction
        fields = [
            'id', 'transaction_type', 'amount', 'balance_after',
            'order_id', 'notes', 'created_at'
        ]
