from rest_framework import generics, permissions
from .serializers import ContactMessageSerializer


class ContactMessageCreateView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
