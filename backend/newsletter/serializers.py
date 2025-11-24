from rest_framework import serializers
from .models import ContactMessage, NewsletterSubscriber

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'is_active', 'subscribed_at']
        read_only_fields = ['id', 'subscribed_at']

    def create(self, validated_data):
        email = validated_data['email']
        # Verifica se já existe um subscriber com este email
        subscriber, created = NewsletterSubscriber.objects.get_or_create(
            email=email,
            defaults={'is_active': True}
        )
        
        # Se já existia mas estava inativo, reativa
        if not created and not subscriber.is_active:
            subscriber.is_active = True
            subscriber.save()
        
        return subscriber
