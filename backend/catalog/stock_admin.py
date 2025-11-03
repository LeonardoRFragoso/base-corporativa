from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .stock_models import StockMovement


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('id', 'variant_link', 'movement_type', 'quantity_display', 'previous_stock', 'new_stock', 'created_by', 'created_at')
    list_filter = ('movement_type', 'created_at')
    search_fields = ('variant__sku', 'variant__product__name', 'reference', 'reason')
    readonly_fields = ('variant', 'movement_type', 'quantity', 'previous_stock', 'new_stock', 'reason', 'reference', 'created_by', 'created_at')
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False  # Não permitir criação manual via admin
    
    def has_delete_permission(self, request, obj=None):
        return False  # Não permitir exclusão de histórico
    
    def variant_link(self, obj):
        url = reverse('admin:catalog_productvariant_change', args=[obj.variant.id])
        return format_html('<a href="{}">{}</a>', url, obj.variant)
    variant_link.short_description = "Variante"
    
    def quantity_display(self, obj):
        if obj.quantity > 0:
            return format_html('<span style="color: green; font-weight: bold;">+{}</span>', obj.quantity)
        return format_html('<span style="color: red; font-weight: bold;">{}</span>', obj.quantity)
    quantity_display.short_description = "Quantidade"
