from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, ProfileSerializer
from .serializers import WishlistItemSerializer
from .models import WishlistItem, EmailVerificationToken, PasswordResetToken
from catalog.models import Product
from .email_utils import send_verification_email, send_password_reset_email
from django.shortcuts import get_object_or_404


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Criar token de verificação e enviar email
        token = EmailVerificationToken.objects.create(user=user)
        try:
            send_verification_email(user, token.token)
        except Exception as e:
            # Log do erro mas não falha o registro
            print(f"Erro ao enviar email de verificação: {e}")
        
        headers = self.get_success_headers(serializer.data)
        return Response({
            'user': serializer.data,
            'message': 'Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.'
        }, status=status.HTTP_201_CREATED, headers=headers)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"error": "refresh token é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except TokenError:
            return Response({"error": "refresh token inválido"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "logout efetuado"}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Solicita reset de senha - envia email com token"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        
        User = get_user_model()
        try:
            user = User.objects.get(email__iexact=email)
            # Invalidar tokens anteriores
            PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
            # Criar novo token
            token = PasswordResetToken.objects.create(user=user)
            try:
                send_password_reset_email(user, token.token)
            except Exception as e:
                print(f"Erro ao enviar email de reset: {e}")
        except User.DoesNotExist:
            pass  # Não revelar se o email existe ou não
        
        return Response({
            "detail": "Se existir uma conta com este email, você receberá instruções para redefinir sua senha."
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Confirma reset de senha com token e nova senha"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def post(self, request):
        token_str = request.data.get("token")
        new_password = request.data.get("password")
        
        if not token_str or not new_password:
            return Response({"error": "Token e senha são obrigatórios"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = PasswordResetToken.objects.get(token=token_str)
            if not token.is_valid():
                return Response({"error": "Token inválido ou expirado"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Atualizar senha
            user = token.user
            user.set_password(new_password)
            user.save()
            
            # Marcar token como usado
            token.used = True
            token.save()
            
            return Response({"detail": "Senha redefinida com sucesso!"}, status=status.HTTP_200_OK)
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Token inválido"}, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(APIView):
    """Verifica email do usuário usando token"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def post(self, request):
        token_str = request.data.get("token")
        
        if not token_str:
            return Response({"error": "Token é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = EmailVerificationToken.objects.get(token=token_str)
            if not token.is_valid():
                return Response({"error": "Token inválido ou expirado"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Marcar email como verificado
            user = token.user
            user.email_verified = True
            user.save()
            
            # Marcar token como usado
            token.used = True
            token.save()
            
            return Response({"detail": "Email verificado com sucesso!"}, status=status.HTTP_200_OK)
        except EmailVerificationToken.DoesNotExist:
            return Response({"error": "Token inválido"}, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationEmailView(APIView):
    """Reenvia email de verificação"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def post(self, request):
        email = request.data.get("email")
        
        if not email:
            return Response({"error": "Email é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        
        User = get_user_model()
        try:
            user = User.objects.get(email__iexact=email)
            
            if user.email_verified:
                return Response({"error": "Este email já foi verificado"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Invalidar tokens anteriores
            EmailVerificationToken.objects.filter(user=user, used=False).update(used=True)
            
            # Criar novo token
            token = EmailVerificationToken.objects.create(user=user)
            try:
                send_verification_email(user, token.token)
            except Exception as e:
                print(f"Erro ao enviar email de verificação: {e}")
                return Response({"error": "Erro ao enviar email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({"detail": "Email de verificação reenviado com sucesso!"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Não revelar se o email existe ou não
            return Response({"detail": "Se existir uma conta com este email, você receberá um novo email de verificação."}, status=status.HTTP_200_OK)


class WishlistListCreateView(generics.ListCreateAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).select_related('product')

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "product_id é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "produto não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        item, _ = WishlistItem.objects.get_or_create(user=request.user, product=product)
        return Response(WishlistItemSerializer(item).data, status=status.HTTP_201_CREATED)


class WishlistDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, product_id: int):
        WishlistItem.objects.filter(user=request.user, product_id=product_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = attrs.get(self.username_field)
        if identifier and '@' in identifier:
            User = get_user_model()
            try:
                user = User.objects.filter(email__iexact=identifier).first()
                if user:
                    attrs[self.username_field] = user.get_username()
            except User.DoesNotExist:
                pass
        
        # Validar credenciais primeiro
        data = super().validate(attrs)
        
        # Verificar se o email foi verificado
        user = self.user
        if not user.email_verified:
            raise serializers.ValidationError({
                'detail': 'Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada e spam.',
                'email_not_verified': True
            })
        
        return data


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
