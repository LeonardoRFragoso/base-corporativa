from django.contrib import admin
from django.utils.html import format_html
from .models import AbandonedCart, AbandonedCartMetrics


@admin.register(AbandonedCart)
class AbandonedCartAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_value', 'status', 'emails_sent_display', 'clicks', 'created_at']
    list_filter = ['status', 'created_at', 'first_email_sent', 'second_email_sent', 'third_email_sent']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['cart_data', 'created_at', 'updated_at', 'recovered_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'status', 'total_value', 'cart_data')
        }),
        ('Emails de Recuperação', {
            'fields': (
                'first_email_sent', 'recovery_coupon_1h',
                'second_email_sent', 'recovery_coupon_24h',
                'third_email_sent', 'recovery_coupon_72h'
            )
        }),
        ('Métricas', {
            'fields': ('recovery_link_clicks', 'recovered_at', 'recovered_order_id')
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def emails_sent_display(self, obj):
        """Mostra quantos emails foram enviados"""
        count = sum([
            bool(obj.first_email_sent),
            bool(obj.second_email_sent),
            bool(obj.third_email_sent)
        ])
        colors = {0: 'red', 1: 'orange', 2: 'blue', 3: 'green'}
        return format_html(
            '<span style="color: {};">{}/3 emails</span>',
            colors.get(count, 'black'),
            count
        )
    emails_sent_display.short_description = 'Emails Enviados'
    
    def clicks(self, obj):
        """Mostra cliques no link"""
        if obj.recovery_link_clicks > 0:
            return format_html(
                '<span style="color: green; font-weight: bold;">{} cliques</span>',
                obj.recovery_link_clicks
            )
        return '0 cliques'
    clicks.short_description = 'Cliques'
    
    actions = ['mark_as_expired']
    
    def mark_as_expired(self, request, queryset):
        """Marca carrinhos como expirados"""
        updated = queryset.update(status='expired')
        self.message_user(request, f'{updated} carrinhos marcados como expirados.')
    mark_as_expired.short_description = 'Marcar como expirado'


@admin.register(AbandonedCartMetrics)
class AbandonedCartMetricsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'total_abandoned', 'total_value_abandoned',
        'total_recovered', 'total_value_recovered', 'recovery_rate_display'
    ]
    list_filter = ['date']
    date_hierarchy = 'date'
    readonly_fields = [
        'date', 'total_abandoned', 'total_value_abandoned',
        'emails_sent_1h', 'emails_sent_24h', 'emails_sent_72h',
        'total_recovered', 'total_value_recovered', 'recovery_rate',
        'created_at', 'updated_at'
    ]
    
    def recovery_rate_display(self, obj):
        """Mostra taxa de recuperação com cor"""
        rate = float(obj.recovery_rate)
        if rate >= 15:
            color = 'green'
        elif rate >= 10:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color,
            rate
        )
    recovery_rate_display.short_description = 'Taxa de Recuperação'
