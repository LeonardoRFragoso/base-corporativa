"""
Serializers para funcionalidades de privacidade e LGPD
"""
from rest_framework import serializers
from .models import UserConsent, DataDeletionRequest, DataExportRequest, User
from django.contrib.auth.password_validation import validate_password


class UserConsentSerializer(serializers.ModelSerializer):
    """Serializer para consentimentos do usuário"""
    consent_type_display = serializers.CharField(source='get_consent_type_display', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserConsent
        fields = [
            'id', 'consent_type', 'consent_type_display', 'consent_given',
            'consent_date', 'version', 'revoked_at', 'is_active'
        ]
        read_only_fields = ['id', 'consent_date', 'revoked_at']


class ConsentCreateSerializer(serializers.Serializer):
    """Serializer para criar/atualizar consentimentos"""
    consent_type = serializers.ChoiceField(choices=UserConsent.CONSENT_TYPES)
    consent_given = serializers.BooleanField()
    version = serializers.CharField(max_length=20, default='1.0')


class DataDeletionRequestSerializer(serializers.ModelSerializer):
    """Serializer para solicitações de exclusão de dados"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = DataDeletionRequest
        fields = [
            'id', 'user_email', 'request_date', 'reason', 'status',
            'status_display', 'processed_date', 'notes'
        ]
        read_only_fields = ['id', 'request_date', 'status', 'processed_date', 'notes']


class DataExportRequestSerializer(serializers.ModelSerializer):
    """Serializer para solicitações de exportação de dados"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = DataExportRequest
        fields = [
            'id', 'request_date', 'status', 'status_display', 'completed_date',
            'download_count', 'expires_at', 'is_expired'
        ]
        read_only_fields = ['id', 'request_date', 'status', 'completed_date', 'download_count', 'expires_at']


class UserDataSerializer(serializers.ModelSerializer):
    """
    Serializer completo dos dados do usuário para exportação (LGPD Art. 18, II)
    Inclui todos os dados pessoais armazenados
    """
    consents = UserConsentSerializer(many=True, read_only=True)
    addresses = serializers.SerializerMethodField()
    orders = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    wishlist = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'date_joined', 'last_login', 'email_verified',
            'consents', 'addresses', 'orders', 'reviews', 'wishlist'
        ]
    
    def get_addresses(self, obj):
        """Retorna endereços do usuário"""
        from addresses.models import Address
        addresses = Address.objects.filter(user=obj)
        return [{
            'id': addr.id,
            'first_name': addr.first_name,
            'last_name': addr.last_name,
            'phone': addr.phone,
            'street': addr.street,
            'number': addr.number,
            'complement': addr.complement,
            'neighborhood': addr.neighborhood,
            'city': addr.city,
            'state': addr.state,
            'zip_code': addr.zip_code,
            'is_default': addr.is_default,
        } for addr in addresses]
    
    def get_orders(self, obj):
        """Retorna pedidos do usuário"""
        from orders.models import Order
        orders = Order.objects.filter(user=obj).prefetch_related('items')
        return [{
            'id': order.id,
            'status': order.status,
            'total_amount': str(order.total_amount),
            'created_at': order.created_at.isoformat(),
            'shipping_address': {
                'street': order.shipping_street,
                'city': order.shipping_city,
                'state': order.shipping_state,
                'zip': order.shipping_zip,
            },
            'items': [{
                'product_name': item.product_name,
                'quantity': item.quantity,
                'unit_price': str(item.unit_price),
            } for item in order.items.all()]
        } for order in orders]
    
    def get_reviews(self, obj):
        """Retorna avaliações do usuário"""
        from reviews.models import Review
        reviews = Review.objects.filter(user=obj)
        return [{
            'id': review.id,
            'product_id': review.product.id,
            'product_name': review.product.name,
            'rating': review.rating,
            'comment': review.comment,
            'created_at': review.created_at.isoformat(),
        } for review in reviews]
    
    def get_wishlist(self, obj):
        """Retorna lista de desejos do usuário"""
        from wishlist.models import WishlistItem
        wishlist_items = WishlistItem.objects.filter(user=obj).select_related('product')
        return [{
            'product_id': item.product.id,
            'product_name': item.product.name,
            'added_at': item.created_at.isoformat(),
        } for item in wishlist_items]


class RegisterWithConsentSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de usuário com consentimentos LGPD
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    terms_accepted = serializers.BooleanField(write_only=True, required=True)
    privacy_accepted = serializers.BooleanField(write_only=True, required=True)
    marketing_accepted = serializers.BooleanField(write_only=True, required=False, default=False)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'terms_accepted', 'privacy_accepted', 'marketing_accepted'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        
        if not attrs.get('terms_accepted'):
            raise serializers.ValidationError({"terms_accepted": "Você deve aceitar os Termos de Uso."})
        
        if not attrs.get('privacy_accepted'):
            raise serializers.ValidationError({"privacy_accepted": "Você deve aceitar a Política de Privacidade."})
        
        return attrs
    
    def create(self, validated_data):
        # Extrair consentimentos
        terms_accepted = validated_data.pop('terms_accepted')
        privacy_accepted = validated_data.pop('privacy_accepted')
        marketing_accepted = validated_data.pop('marketing_accepted', False)
        validated_data.pop('password2')
        
        # Criar usuário
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Obter IP e User-Agent do request
        request = self.context.get('request')
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
        
        # Registrar consentimentos
        UserConsent.objects.create(
            user=user,
            consent_type='terms',
            consent_given=terms_accepted,
            ip_address=ip_address,
            user_agent=user_agent,
            version='1.0'
        )
        
        UserConsent.objects.create(
            user=user,
            consent_type='privacy',
            consent_given=privacy_accepted,
            ip_address=ip_address,
            user_agent=user_agent,
            version='1.0'
        )
        
        if marketing_accepted:
            UserConsent.objects.create(
                user=user,
                consent_type='marketing',
                consent_given=True,
                ip_address=ip_address,
                user_agent=user_agent,
                version='1.0'
            )
        
        return user
    
    def get_client_ip(self, request):
        """Obtém o IP real do cliente"""
        if not request:
            return '0.0.0.0'
        
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR', '0.0.0.0')
        return ip
