from django.contrib import admin
from django.utils.html import format_html
from .models import GiftCard, GiftCardTransaction, GiftCardDesign


@admin.register(GiftCard)
class GiftCardAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'status_display', 'initial_value', 'current_balance',
        'recipient_email', 'valid_until', 'is_valid_display'
    ]
    list_filter = ['status', 'valid_from', 'valid_until', 'created_at']
    search_fields = ['code', 'recipient_email', 'recipient_name', 'purchased_by__email']
    readonly_fields = [
        'code', 'created_at', 'updated_at', 'sent_at',
        'first_used_at', 'fully_used_at'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Informações do Gift Card', {
            'fields': ('code', 'status', 'initial_value', 'current_balance')
        }),
        ('Comprador e Destinatário', {
            'fields': ('purchased_by', 'recipient_email', 'recipient_name', 'message')
        }),
        ('Validade', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Rastreamento', {
            'fields': (
                'order_id', 'sent_at', 'first_used_at', 'fully_used_at',
                'created_at', 'updated_at'
            )
        }),
    )
    
    def status_display(self, obj):
        """Mostra status com cor"""
        colors = {
            'active': 'green',
            'used': 'gray',
            'expired': 'red',
            'cancelled': 'orange'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def is_valid_display(self, obj):
        """Mostra se é válido"""
        if obj.is_valid():
            return format_html('<span style="color: green;">✓ Válido</span>')
        return format_html('<span style="color: red;">✗ Inválido</span>')
    is_valid_display.short_description = 'Válido?'
    
    actions = ['mark_as_cancelled']
    
    def mark_as_cancelled(self, request, queryset):
        """Cancela gift cards"""
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} gift cards cancelados.')
    mark_as_cancelled.short_description = 'Cancelar gift cards selecionados'


@admin.register(GiftCardTransaction)
class GiftCardTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'gift_card', 'transaction_type', 'amount',
        'balance_after', 'order_id', 'created_at'
    ]
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['gift_card__code', 'order_id', 'user__email']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(GiftCardDesign)
class GiftCardDesignAdmin(admin.ModelAdmin):
    list_display = ['name', 'occasion', 'is_active', 'is_default', 'image_preview']
    list_filter = ['occasion', 'is_active', 'is_default']
    search_fields = ['name', 'description']
    
    def image_preview(self, obj):
        """Mostra preview da imagem"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 100px;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Preview'
