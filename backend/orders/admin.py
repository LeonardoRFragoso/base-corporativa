from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'unit_price', 'quantity', 'subtotal')
    can_delete = False
    
    def subtotal(self, obj):
        if obj.id:
            return f"R$ {(obj.unit_price * obj.quantity):.2f}"
        return "-"
    subtotal.short_description = "Subtotal"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'user_link', 
        'status_badge', 
        'total_amount_display', 
        'items_count',
        'created_at',
        'mp_payment_id'
    )
    list_filter = ('status', 'created_at', 'mp_status')
    search_fields = ('id', 'email', 'first_name', 'last_name', 'mp_payment_id', 'external_reference')
    readonly_fields = (
        'created_at', 
        'updated_at', 
        'external_reference', 
        'mp_payment_id',
        'mp_status',
        'total_amount_display'
    )
    inlines = [OrderItemInline]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Informações do Pedido', {
            'fields': ('id', 'status', 'created_at', 'updated_at')
        }),
        ('Cliente', {
            'fields': ('user', 'email', 'first_name', 'last_name')
        }),
        ('Valores', {
            'fields': ('total_amount_display', 'shipping_price', 'discount_amount', 'coupon_code', 'currency')
        }),
        ('Entrega', {
            'fields': ('shipping_address', 'destination_zip', 'shipping_service_name', 'shipping_carrier')
        }),
        ('Pagamento (Mercado Pago)', {
            'fields': ('mp_payment_id', 'mp_status', 'external_reference')
        }),
    )
    
    def user_link(self, obj):
        if obj.user:
            url = reverse('admin:users_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.email)
        return obj.email or "-"
    user_link.short_description = "Cliente"
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'paid': '#28a745',
            'failed': '#dc3545',
            'canceled': '#6c757d'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"
    
    def total_amount_display(self, obj):
        return f"R$ {obj.total_amount:.2f}"
    total_amount_display.short_description = "Total"
    
    def items_count(self, obj):
        return obj.items.count()
    items_count.short_description = "Itens"
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'shipping_address').prefetch_related('items')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_link', 'product_name', 'quantity', 'unit_price', 'subtotal_display')
    list_filter = ('created_at',)
    search_fields = ('product_name', 'order__id', 'order__email')
    readonly_fields = ('created_at', 'subtotal_display')
    
    def order_link(self, obj):
        url = reverse('admin:orders_order_change', args=[obj.order.id])
        return format_html('<a href="{}">Pedido #{}</a>', url, obj.order.id)
    order_link.short_description = "Pedido"
    
    def subtotal_display(self, obj):
        return f"R$ {(obj.unit_price * obj.quantity):.2f}"
    subtotal_display.short_description = "Subtotal"
