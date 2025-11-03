from django.db.models import Count, Q, F
from django.core.cache import cache
from .models import Product
from orders.models import OrderItem


class ProductRecommendations:
    """Sistema de recomendações de produtos"""
    
    @staticmethod
    def get_frequently_bought_together(product_id, limit=4):
        """Produtos frequentemente comprados juntos"""
        cache_key = f'recommendations_bought_together_{product_id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Buscar pedidos que contêm este produto
        orders_with_product = OrderItem.objects.filter(
            variant__product_id=product_id,
            order__status='paid'
        ).values_list('order_id', flat=True).distinct()
        
        # Buscar outros produtos nesses pedidos
        related_products = OrderItem.objects.filter(
            order_id__in=orders_with_product,
            order__status='paid'
        ).exclude(
            variant__product_id=product_id
        ).values(
            'variant__product_id',
            'variant__product__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:limit]
        
        product_ids = [item['variant__product_id'] for item in related_products]
        products = Product.objects.filter(id__in=product_ids, is_active=True)
        
        # Cache por 1 hora
        cache.set(cache_key, products, 3600)
        return products
    
    @staticmethod
    def get_similar_products(product_id, limit=4):
        """Produtos similares (mesma categoria e faixa de preço)"""
        cache_key = f'recommendations_similar_{product_id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        try:
            product = Product.objects.get(id=product_id)
            
            # Faixa de preço (±30%)
            min_price = product.base_price * 0.7
            max_price = product.base_price * 1.3
            
            similar = Product.objects.filter(
                category=product.category,
                is_active=True,
                base_price__gte=min_price,
                base_price__lte=max_price
            ).exclude(id=product_id)[:limit]
            
            cache.set(cache_key, similar, 3600)
            return similar
        except Product.DoesNotExist:
            return Product.objects.none()
    
    @staticmethod
    def get_trending_products(limit=8):
        """Produtos em alta (mais vendidos nos últimos 30 dias)"""
        cache_key = 'recommendations_trending'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        from django.utils import timezone
        from datetime import timedelta
        
        last_30_days = timezone.now() - timedelta(days=30)
        
        trending = OrderItem.objects.filter(
            order__created_at__gte=last_30_days,
            order__status='paid'
        ).values(
            'variant__product_id'
        ).annotate(
            sales_count=Count('id')
        ).order_by('-sales_count')[:limit]
        
        product_ids = [item['variant__product_id'] for item in trending]
        products = Product.objects.filter(id__in=product_ids, is_active=True)
        
        # Cache por 6 horas
        cache.set(cache_key, products, 21600)
        return products
    
    @staticmethod
    def get_personalized_recommendations(user, limit=8):
        """Recomendações personalizadas baseadas no histórico"""
        if not user or not user.is_authenticated:
            return ProductRecommendations.get_trending_products(limit)
        
        cache_key = f'recommendations_personalized_{user.id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Categorias que o usuário já comprou
        user_categories = OrderItem.objects.filter(
            order__user=user,
            order__status='paid'
        ).values_list('variant__product__category_id', flat=True).distinct()
        
        if not user_categories:
            return ProductRecommendations.get_trending_products(limit)
        
        # Produtos dessas categorias que o usuário ainda não comprou
        purchased_products = OrderItem.objects.filter(
            order__user=user,
            order__status='paid'
        ).values_list('variant__product_id', flat=True).distinct()
        
        recommendations = Product.objects.filter(
            category_id__in=user_categories,
            is_active=True
        ).exclude(
            id__in=purchased_products
        ).order_by('-created_at')[:limit]
        
        cache.set(cache_key, recommendations, 3600)
        return recommendations
    
    @staticmethod
    def get_complete_the_look(product_id, limit=3):
        """Complete o look - produtos complementares"""
        cache_key = f'recommendations_complete_look_{product_id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        try:
            product = Product.objects.get(id=product_id)
            
            # Buscar produtos de categorias complementares
            # (você pode definir regras específicas aqui)
            complementary = Product.objects.filter(
                is_active=True
            ).exclude(
                id=product_id
            ).exclude(
                category=product.category
            )[:limit]
            
            cache.set(cache_key, complementary, 3600)
            return complementary
        except Product.DoesNotExist:
            return Product.objects.none()
    
    @staticmethod
    def clear_cache(product_id=None):
        """Limpa cache de recomendações"""
        if product_id:
            cache.delete(f'recommendations_bought_together_{product_id}')
            cache.delete(f'recommendations_similar_{product_id}')
            cache.delete(f'recommendations_complete_look_{product_id}')
        else:
            cache.delete('recommendations_trending')
