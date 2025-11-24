from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import ContactMessageSerializer, NewsletterSubscriberSerializer
from .emails import send_welcome_email
import logging

logger = logging.getLogger(__name__)


class ContactMessageCreateView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []


class NewsletterSubscribeView(generics.CreateAPIView):
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # Enviar email de boas-vindas
        email = serializer.validated_data['email']
        email_sent = send_welcome_email(email)
        
        if not email_sent:
            logger.warning(f"Inscrição realizada mas email não foi enviado para {email}")
        
        return Response(
            {
                'message': 'Inscrição realizada com sucesso! Verifique seu email.',
                'data': serializer.data,
                'email_sent': email_sent
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def perform_create(self, serializer):
        return serializer.save()
