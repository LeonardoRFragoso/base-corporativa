from django.contrib import admin
from .models import ProductView, ProductRecommendation, UserRecommendation


@admin.register(ProductView)
class ProductViewAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['user__email', 'product__name', 'session_id']
    date_hierarchy = 'viewed_at'


@admin.register(ProductRecommendation)
class ProductRecommendationAdmin(admin.ModelAdmin):
    list_display = ['product', 'recommended_product', 'recommendation_type', 'score', 'updated_at']
    list_filter = ['recommendation_type', 'updated_at']
    search_fields = ['product__name', 'recommended_product__name']
    ordering = ['-score']


@admin.register(UserRecommendation)
class UserRecommendationAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'score', 'reason', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'product__name']
    ordering = ['-score']
