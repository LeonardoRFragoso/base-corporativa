from django.contrib import admin
from django.utils.html import format_html
from .models import WishlistCollection, WishlistItem, WishlistNotification, WishlistAnalytics


class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 0
    readonly_fields = ['price_when_added', 'stock_when_added', 'created_at']
    fields = ['product', 'priority', 'notify_on_sale', 'notify_on_stock', 'target_price']


@admin.register(WishlistCollection)
class WishlistCollectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'is_default', 'is_public', 'items_count', 'created_at']
    list_filter = ['is_default', 'is_public', 'created_at']
    search_fields = ['name', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['share_token', 'created_at', 'updated_at']
    inlines = [WishlistItemInline]
    
    def items_count(self, obj):
        count = obj.items.count()
        return format_html('<strong>{}</strong> itens', count)
    items_count.short_description = 'Itens'


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = [
        'product', 'collection', 'priority', 'price_comparison',
        'notifications_enabled', 'created_at'
    ]
    list_filter = ['priority', 'notify_on_sale', 'notify_on_stock', 'created_at']
    search_fields = ['product__name', 'collection__name', 'collection__user__email']
    readonly_fields = ['price_when_added', 'stock_when_added', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Produto', {
            'fields': ('collection', 'product', 'priority', 'notes')
        }),
        ('Notificações', {
            'fields': (
                'notify_on_sale', 'notify_on_stock', 'notify_on_price_drop',
                'target_price'
            )
        }),
        ('Rastreamento', {
            'fields': ('price_when_added', 'stock_when_added', 'created_at', 'updated_at')
        }),
    )
    
    def price_comparison(self, obj):
        """Mostra comparação de preço"""
        current = obj.product.price
        original = obj.price_when_added
        
        if current < original:
            diff = original - current
            percent = (diff / original) * 100
            return format_html(
                '<span style="color: green;">↓ R$ {} ({:.0f}%)</span>',
                diff, percent
            )
        elif current > original:
            diff = current - original
            percent = (diff / original) * 100
            return format_html(
                '<span style="color: red;">↑ R$ {} ({:.0f}%)</span>',
                diff, percent
            )
        return 'Sem mudança'
    price_comparison.short_description = 'Mudança de Preço'
    
    def notifications_enabled(self, obj):
        """Mostra quais notificações estão ativas"""
        flags = []
        if obj.notify_on_sale:
            flags.append('🏷️')
        if obj.notify_on_stock:
            flags.append('📦')
        if obj.notify_on_price_drop:
            flags.append('💰')
        return ' '.join(flags) if flags else '-'
    notifications_enabled.short_description = 'Notificações'


@admin.register(WishlistNotification)
class WishlistNotificationAdmin(admin.ModelAdmin):
    list_display = [
        'wishlist_item', 'notification_type', 'was_clicked', 'sent_at'
    ]
    list_filter = ['notification_type', 'was_clicked', 'sent_at']
    search_fields = ['wishlist_item__product__name', 'message']
    readonly_fields = ['sent_at']
    date_hierarchy = 'sent_at'


@admin.register(WishlistAnalytics)
class WishlistAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'product', 'total_wishlists', 'last_30_days_additions',
        'trending_score_display', 'conversion_rate', 'updated_at'
    ]
    list_filter = ['updated_at']
    search_fields = ['product__name']
    readonly_fields = [
        'total_wishlists', 'total_conversions', 'conversion_rate',
        'last_30_days_additions', 'trending_score', 'updated_at'
    ]
    ordering = ['-total_wishlists']
    
    def trending_score_display(self, obj):
        """Mostra trending score com cor"""
        score = obj.trending_score
        if score >= 50:
            color = 'green'
            icon = '🔥'
        elif score >= 25:
            color = 'orange'
            icon = '📈'
        else:
            color = 'gray'
            icon = '📊'
        return format_html(
            '{} <span style="color: {};">{:.1f}%</span>',
            icon, color, score
        )
    trending_score_display.short_description = 'Trending'
    
    actions = ['update_analytics']
    
    def update_analytics(self, request, queryset):
        """Atualiza analytics dos produtos selecionados"""
        for analytics in queryset:
            analytics.update_stats()
        self.message_user(request, f'{queryset.count()} analytics atualizados.')
    update_analytics.short_description = 'Atualizar analytics'
