from django.contrib.auth import get_user_model
from django.db import models
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, ProfileSerializer
from .serializers import WishlistItemSerializer, UserListSerializer
from .serializers_privacy import RegisterWithConsentSerializer
from .models import WishlistItem, EmailVerificationToken, PasswordResetToken
from catalog.models import Product
from .email_utils import send_verification_email, send_password_reset_email
from .tasks import send_verification_email_async, send_password_reset_email_async
from .tasks_sync import send_verification_email_sync, send_password_reset_email_sync
import os
from django.shortcuts import get_object_or_404


class RegisterView(generics.CreateAPIView):
    # Usar o novo serializer com consentimentos LGPD
    serializer_class = RegisterWithConsentSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Criar token de verificação e enviar email
        token = EmailVerificationToken.objects.create(user=user)
        
        # SEMPRE usar modo síncrono para garantir que o email seja enviado
        # Em produção, threads daemon podem ser terminadas antes de completar
        print(f"📧 Enviando email de verificação para: {user.email}")
        try:
            send_verification_email_sync(user, token.token)
        except Exception as e:
            print(f"⚠️ Erro no envio de email, mas cadastro foi criado: {e}")
            import traceback
            traceback.print_exc()
        
        headers = self.get_success_headers(serializer.data)
        return Response({
            'user': {
                'username': user.username,
                'email': user.email,
            },
            'message': 'Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.',
            'consents_registered': True
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
            # Enviar email em background
            send_password_reset_email_async(user, token.token)
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
        identifier = request.data.get("email") or request.data.get("identifier")
        
        if not identifier:
            return Response({"error": "Email ou usuário é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        
        User = get_user_model()
        try:
            if '@' in identifier:
                user = User.objects.get(email__iexact=identifier)
            else:
                user = User.objects.get(username__iexact=identifier)
            
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
        # Permitir staff/superuser logarem mesmo sem verificação de email
        if not user.email_verified and not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError({
                'detail': 'Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada e spam.',
                'email_not_verified': True
            })
        
        return data


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class UserListView(generics.ListAPIView):
    """Lista usuários para administradores"""
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        User = get_user_model()
        queryset = User.objects.all().order_by('-date_joined')
        
        # Filtrar apenas clientes (não staff) por padrão
        is_staff = self.request.query_params.get('is_staff')
        if is_staff is not None:
            is_staff_bool = is_staff.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_staff=is_staff_bool)
        
        # Filtrar por status ativo
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            is_active_bool = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active_bool)
        
        # Busca por email, nome ou username
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(email__icontains=search) |
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(username__icontains=search)
            )
        
        return queryset
