from django.db.models import Count, Q, F
from django.core.cache import cache
from collections import defaultdict
from .models import ProductView, ProductRecommendation, UserRecommendation
from catalog.models import Product
from orders.models import Order, OrderItem
from datetime import timedelta
from django.utils import timezone


class RecommendationEngine:
    """Motor de recomendações de produtos"""
    
    @staticmethod
    def track_view(product, user=None, session_id=None):
        """Registra visualização de produto"""
        ProductView.objects.create(
            product=product,
            user=user,
            session_id=session_id or ''
        )
    
    @staticmethod
    def get_also_bought(product, limit=6):
        """Produtos frequentemente comprados juntos"""
        cache_key = f'also_bought_{product.id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Buscar pedidos que contêm este produto
        orders_with_product = OrderItem.objects.filter(
            product=product
        ).values_list('order_id', flat=True)
        
        # Buscar outros produtos nesses pedidos
        related_products = OrderItem.objects.filter(
            order_id__in=orders_with_product
        ).exclude(
            product=product
        ).values('product').annotate(
            count=Count('product')
        ).order_by('-count')[:limit]
        
        product_ids = [item['product'] for item in related_products]
        products = Product.objects.filter(
            id__in=product_ids,
            is_active=True,
            stock__gt=0
        )
        
        # Cache por 1 hora
        cache.set(cache_key, list(products), 3600)
        return products
    
    @staticmethod
    def get_related_by_category(product, limit=6):
        """Produtos da mesma categoria"""
        cache_key = f'related_category_{product.id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        products = Product.objects.filter(
            category=product.category,
            is_active=True,
            stock__gt=0
        ).exclude(
            id=product.id
        ).order_by('-created_at')[:limit]
        
        cache.set(cache_key, list(products), 3600)
        return products
    
    @staticmethod
    def get_user_recommendations(user, limit=10):
        """Recomendações personalizadas baseadas no histórico"""
        if not user.is_authenticated:
            return Product.objects.none()
        
        cache_key = f'user_recommendations_{user.id}'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Produtos visualizados recentemente (últimos 30 dias)
        recent_views = ProductView.objects.filter(
            user=user,
            viewed_at__gte=timezone.now() - timedelta(days=30)
        ).values_list('product_id', flat=True)[:20]
        
        # Produtos comprados
        purchased = OrderItem.objects.filter(
            order__user=user,
            order__status='completed'
        ).values_list('product_id', flat=True)
        
        # Buscar produtos relacionados aos visualizados
        recommendations = []
        for product_id in recent_views:
            try:
                product = Product.objects.get(id=product_id)
                related = RecommendationEngine.get_also_bought(product, limit=3)
                recommendations.extend(related)
            except Product.DoesNotExist:
                continue
        
        # Remover duplicatas e produtos já comprados
        seen = set()
        unique_recommendations = []
        for product in recommendations:
            if product.id not in seen and product.id not in purchased:
                seen.add(product.id)
                unique_recommendations.append(product)
                if len(unique_recommendations) >= limit:
                    break
        
        # Se não houver recomendações suficientes, adicionar best sellers
        if len(unique_recommendations) < limit:
            best_sellers = Product.objects.filter(
                is_active=True,
                stock__gt=0
            ).exclude(
                id__in=[p.id for p in unique_recommendations]
            ).exclude(
                id__in=purchased
            ).order_by('-created_at')[:limit - len(unique_recommendations)]
            
            unique_recommendations.extend(best_sellers)
        
        cache.set(cache_key, unique_recommendations, 1800)  # 30 minutos
        return unique_recommendations
    
    @staticmethod
    def get_trending_products(limit=10):
        """Produtos em alta (mais visualizados nos últimos 7 dias)"""
        cache_key = 'trending_products'
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        seven_days_ago = timezone.now() - timedelta(days=7)
        trending = ProductView.objects.filter(
            viewed_at__gte=seven_days_ago
        ).values('product').annotate(
            view_count=Count('product')
        ).order_by('-view_count')[:limit]
        
        product_ids = [item['product'] for item in trending]
        products = Product.objects.filter(
            id__in=product_ids,
            is_active=True,
            stock__gt=0
        )
        
        cache.set(cache_key, list(products), 1800)
        return products
    
    @staticmethod
    def generate_recommendations_batch():
        """Gera recomendações em lote (executar via Celery task)"""
        products = Product.objects.filter(is_active=True)
        
        for product in products:
            # Limpar recomendações antigas
            ProductRecommendation.objects.filter(product=product).delete()
            
            # Gerar "também compraram"
            also_bought = RecommendationEngine.get_also_bought(product, limit=10)
            for idx, rec_product in enumerate(also_bought):
                ProductRecommendation.objects.create(
                    product=product,
                    recommended_product=rec_product,
                    recommendation_type='also_bought',
                    score=10 - idx  # Score decrescente
                )
            
            # Gerar "relacionados"
            related = RecommendationEngine.get_related_by_category(product, limit=10)
            for idx, rec_product in enumerate(related):
                ProductRecommendation.objects.create(
                    product=product,
                    recommended_product=rec_product,
                    recommendation_type='related',
                    score=10 - idx
                )
        
        return f"Geradas recomendações para {products.count()} produtos"
