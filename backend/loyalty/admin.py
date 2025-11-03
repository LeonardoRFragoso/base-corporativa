from django.contrib import admin
from django.utils.html import format_html
from .models import LoyaltyTier, CustomerLoyalty, PointsTransaction


@admin.register(LoyaltyTier)
class LoyaltyTierAdmin(admin.ModelAdmin):
    list_display = ('name', 'min_points', 'cashback_display', 'color_preview')
    ordering = ['min_points']
    
    def cashback_display(self, obj):
        return format_html('<strong style="color: green;">{}%</strong>', obj.cashback_percentage)
    cashback_display.short_description = 'Cashback'
    
    def color_preview(self, obj):
        return format_html(
            '<div style="width: 30px; height: 20px; background-color: {}; border: 1px solid #ccc;"></div>',
            obj.color
        )
    color_preview.short_description = 'Cor'


@admin.register(CustomerLoyalty)
class CustomerLoyaltyAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'current_tier', 'total_points', 'available_points', 'lifetime_spent')
    list_filter = ('current_tier',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('total_points', 'lifetime_spent', 'created_at', 'updated_at')
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Cliente'
    user_email.admin_order_field = 'user__email'


@admin.register(PointsTransaction)
class PointsTransactionAdmin(admin.ModelAdmin):
    list_display = ('customer_email', 'points_display', 'transaction_type', 'reason', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('customer__user__email', 'reason')
    readonly_fields = ('customer', 'points', 'transaction_type', 'reason', 'order_id', 'created_at')
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def customer_email(self, obj):
        return obj.customer.user.email
    customer_email.short_description = 'Cliente'
    
    def points_display(self, obj):
        if obj.points > 0:
            return format_html('<span style="color: green; font-weight: bold;">+{}</span>', obj.points)
        return format_html('<span style="color: red; font-weight: bold;">{}</span>', obj.points)
    points_display.short_description = 'Pontos'
