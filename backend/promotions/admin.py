from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import FlashSale


@admin.register(FlashSale)
class FlashSaleAdmin(admin.ModelAdmin):
    list_display = ('name', 'discount_display', 'status_badge', 'time_info', 'sold_info', 'is_active')
    list_filter = ('is_active', 'start_time', 'end_time')
    search_fields = ('name', 'description')
    filter_horizontal = ('products',)
    date_hierarchy = 'start_time'
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'description', 'banner_image', 'is_active')
        }),
        ('Desconto', {
            'fields': ('discount_percentage',)
        }),
        ('Período', {
            'fields': ('start_time', 'end_time')
        }),
        ('Estoque', {
            'fields': ('max_quantity', 'current_sold')
        }),
        ('Produtos', {
            'fields': ('products',)
        }),
    )
    
    readonly_fields = ('current_sold',)
    
    def discount_display(self, obj):
        return format_html('<strong style="color: #dc3545; font-size: 16px;">{}% OFF</strong>', obj.discount_percentage)
    discount_display.short_description = 'Desconto'
    
    def status_badge(self, obj):
        if obj.is_live():
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 3px; animation: pulse 2s infinite;">🔥 AO VIVO</span>'
            )
        elif timezone.now() < obj.start_time:
            return format_html(
                '<span style="background-color: #ffc107; color: black; padding: 5px 10px; border-radius: 3px;">⏰ AGENDADO</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #6c757d; color: white; padding: 5px 10px; border-radius: 3px;">✓ FINALIZADO</span>'
            )
    status_badge.short_description = 'Status'
    
    def time_info(self, obj):
        now = timezone.now()
        if obj.is_live():
            remaining = obj.time_remaining()
            hours = remaining // 3600
            minutes = (remaining % 3600) // 60
            return format_html('<span style="color: #dc3545; font-weight: bold;">⏱️ {}h {}min restantes</span>', hours, minutes)
        elif now < obj.start_time:
            return f"Inicia em {obj.start_time.strftime('%d/%m/%Y %H:%M')}"
        return f"Finalizado em {obj.end_time.strftime('%d/%m/%Y %H:%M')}"
    time_info.short_description = 'Tempo'
    
    def sold_info(self, obj):
        if obj.max_quantity:
            percentage = (obj.current_sold / obj.max_quantity) * 100
            return format_html(
                '{} / {} <span style="color: #6c757d;">({:.0f}%)</span>',
                obj.current_sold, obj.max_quantity, percentage
            )
        return f"{obj.current_sold} vendidos"
    sold_info.short_description = 'Vendas'
