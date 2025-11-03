from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import DiscountCode


@admin.register(DiscountCode)
class DiscountCodeAdmin(admin.ModelAdmin):
    list_display = (
        'code', 
        'discount_display', 
        'active_badge', 
        'times_used', 
        'usage_limit', 
        'validity_period',
        'created_at'
    )
    list_filter = ('active', 'created_at', 'valid_from', 'valid_until')
    search_fields = ('code',)
    actions = ['activate_codes', 'deactivate_codes', 'reset_usage']
    readonly_fields = ('times_used', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Informações do Cupom', {
            'fields': ('code', 'active')
        }),
        ('Desconto', {
            'fields': ('percent_off', 'amount_off'),
            'description': 'Preencha apenas um dos campos (percentual OU valor fixo)'
        }),
        ('Validade', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Limite de Uso', {
            'fields': ('usage_limit', 'times_used')
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def discount_display(self, obj):
        if obj.percent_off:
            return format_html('<strong style="color: #10b981;">{}%</strong>', obj.percent_off)
        elif obj.amount_off:
            return format_html('<strong style="color: #10b981;">R$ {:.2f}</strong>', obj.amount_off)
        return '-'
    discount_display.short_description = 'Desconto'
    
    def active_badge(self, obj):
        if obj.active:
            # Check if expired
            now = timezone.now()
            if obj.valid_until and now > obj.valid_until:
                return format_html(
                    '<span style="background-color: #fbbf24; color: white; padding: 3px 10px; border-radius: 3px;">EXPIRADO</span>'
                )
            return format_html(
                '<span style="background-color: #10b981; color: white; padding: 3px 10px; border-radius: 3px;">ATIVO</span>'
            )
        return format_html(
            '<span style="background-color: #6b7280; color: white; padding: 3px 10px; border-radius: 3px;">INATIVO</span>'
        )
    active_badge.short_description = 'Status'
    
    def validity_period(self, obj):
        if not obj.valid_from and not obj.valid_until:
            return format_html('<span style="color: #10b981;">Sem limite</span>')
        
        from_date = obj.valid_from.strftime('%d/%m/%Y') if obj.valid_from else 'Início'
        until_date = obj.valid_until.strftime('%d/%m/%Y') if obj.valid_until else 'Sem fim'
        
        return f"{from_date} até {until_date}"
    validity_period.short_description = 'Período de Validade'
    
    def activate_codes(self, request, queryset):
        updated = queryset.update(active=True)
        self.message_user(request, f'{updated} cupom(ns) ativado(s) com sucesso.')
    activate_codes.short_description = "Ativar cupons selecionados"
    
    def deactivate_codes(self, request, queryset):
        updated = queryset.update(active=False)
        self.message_user(request, f'{updated} cupom(ns) desativado(s) com sucesso.')
    deactivate_codes.short_description = "Desativar cupons selecionados"
    
    def reset_usage(self, request, queryset):
        updated = queryset.update(times_used=0)
        self.message_user(request, f'Contador de uso resetado para {updated} cupom(ns).')
    reset_usage.short_description = "Resetar contador de uso"
