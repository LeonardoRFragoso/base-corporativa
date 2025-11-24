from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import ContactMessageSerializer, NewsletterSubscriberSerializer


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
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Inscrição realizada com sucesso!',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
