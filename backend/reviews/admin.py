from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'product_link',
        'user_link',
        'rating_stars',
        'approved_badge',
        'created_at'
    )
    list_filter = ('approved', 'rating', 'created_at')
    search_fields = ('product__name', 'user__email', 'title', 'comment')
    actions = ['approve_reviews', 'reject_reviews']
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Informações da Avaliação', {
            'fields': ('product', 'user', 'rating', 'title', 'comment')
        }),
        ('Moderação', {
            'fields': ('approved', 'admin_response')
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def product_link(self, obj):
        url = reverse('admin:catalog_product_change', args=[obj.product.id])
        return format_html('<a href="{}">{}</a>', url, obj.product.name)
    product_link.short_description = "Produto"
    
    def user_link(self, obj):
        if obj.user:
            url = reverse('admin:users_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.email)
        return "Anônimo"
    user_link.short_description = "Usuário"
    
    def rating_stars(self, obj):
        stars = '⭐' * obj.rating
        return format_html('<span style="font-size: 16px;">{}</span>', stars)
    rating_stars.short_description = "Avaliação"
    
    def approved_badge(self, obj):
        if obj.approved:
            return format_html(
                '<span style="background-color: #10b981; color: white; padding: 3px 10px; border-radius: 3px;">APROVADO</span>'
            )
        return format_html(
            '<span style="background-color: #f59e0b; color: white; padding: 3px 10px; border-radius: 3px;">PENDENTE</span>'
        )
    approved_badge.short_description = "Status"
    
    def approve_reviews(self, request, queryset):
        updated = queryset.update(approved=True)
        self.message_user(request, f'{updated} avaliação(ões) aprovada(s) com sucesso.')
    approve_reviews.short_description = "Aprovar avaliações selecionadas"
    
    def reject_reviews(self, request, queryset):
        updated = queryset.update(approved=False)
        self.message_user(request, f'{updated} avaliação(ões) rejeitada(s).')
    reject_reviews.short_description = "Rejeitar avaliações selecionadas"
