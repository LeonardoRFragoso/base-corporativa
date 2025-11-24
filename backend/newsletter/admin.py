from django.contrib import admin
from .models import ContactMessage, NewsletterSubscriber


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "subject", "created_at")
    search_fields = ("name", "email", "subject", "message")
    list_filter = ("created_at",)


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "subscribed_at", "updated_at")
    search_fields = ("email",)
    list_filter = ("is_active", "subscribed_at")
    readonly_fields = ("subscribed_at", "updated_at")
    actions = ["activate_subscribers", "deactivate_subscribers"]

    def activate_subscribers(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} inscritos ativados com sucesso.")
    activate_subscribers.short_description = "Ativar inscritos selecionados"

    def deactivate_subscribers(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} inscritos desativados com sucesso.")
    deactivate_subscribers.short_description = "Desativar inscritos selecionados"
