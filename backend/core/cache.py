"""
Sistema de cache para melhorar performance do e-commerce
Implementa cache em memória e decorators para views
"""

from functools import wraps
from django.core.cache import cache
from django.conf import settings
import hashlib
import json


def generate_cache_key(prefix, *args, **kwargs):
    """Gera chave de cache única baseada nos argumentos"""
    key_data = {
        'args': args,
        'kwargs': kwargs
    }
    key_string = json.dumps(key_data, sort_keys=True)
    key_hash = hashlib.md5(key_string.encode()).hexdigest()
    return f"{prefix}:{key_hash}"


def cache_response(timeout=300, key_prefix='view'):
    """
    Decorator para cachear respostas de views
    
    Usage:
        @cache_response(timeout=600, key_prefix='products')
        def my_view(request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Gera chave única baseada na URL e query params
            cache_key = generate_cache_key(
                key_prefix,
                request.path,
                request.GET.dict(),
                request.user.id if request.user.is_authenticated else None
            )
            
            # Tenta buscar do cache
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                return cached_response
            
            # Executa a view e cacheia o resultado
            response = view_func(request, *args, **kwargs)
            cache.set(cache_key, response, timeout)
            
            return response
        return wrapper
    return decorator


def invalidate_cache(pattern):
    """
    Invalida cache baseado em padrão
    
    Usage:
        invalidate_cache('products:*')
    """
    try:
        cache.delete_pattern(pattern)
    except AttributeError:
        # Fallback se delete_pattern não estiver disponível
        cache.clear()


class CacheManager:
    """Gerenciador centralizado de cache"""
    
    # Timeouts padrão (em segundos)
    TIMEOUT_SHORT = 60  # 1 minuto
    TIMEOUT_MEDIUM = 300  # 5 minutos
    TIMEOUT_LONG = 900  # 15 minutos
    TIMEOUT_VERY_LONG = 3600  # 1 hora
    
    @staticmethod
    def get_products_list(filters=None):
        """Cache para lista de produtos"""
        key = generate_cache_key('products_list', filters or {})
        return cache.get(key)
    
    @staticmethod
    def set_products_list(data, filters=None, timeout=TIMEOUT_MEDIUM):
        """Salva lista de produtos no cache"""
        key = generate_cache_key('products_list', filters or {})
        cache.set(key, data, timeout)
    
    @staticmethod
    def get_product_detail(product_id):
        """Cache para detalhes de produto"""
        key = f'product_detail:{product_id}'
        return cache.get(key)
    
    @staticmethod
    def set_product_detail(product_id, data, timeout=TIMEOUT_LONG):
        """Salva detalhes de produto no cache"""
        key = f'product_detail:{product_id}'
        cache.set(key, data, timeout)
    
    @staticmethod
    def invalidate_product(product_id):
        """Invalida cache de um produto específico"""
        cache.delete(f'product_detail:{product_id}')
        invalidate_cache('products_list:*')
    
    @staticmethod
    def get_categories():
        """Cache para categorias"""
        return cache.get('categories_list')
    
    @staticmethod
    def set_categories(data, timeout=TIMEOUT_VERY_LONG):
        """Salva categorias no cache"""
        cache.set('categories_list', data, timeout)
    
    @staticmethod
    def invalidate_categories():
        """Invalida cache de categorias"""
        cache.delete('categories_list')
    
    @staticmethod
    def get_cart(cart_id):
        """Cache para carrinho"""
        key = f'cart:{cart_id}'
        return cache.get(key)
    
    @staticmethod
    def set_cart(cart_id, data, timeout=TIMEOUT_SHORT):
        """Salva carrinho no cache"""
        key = f'cart:{cart_id}'
        cache.set(key, data, timeout)
    
    @staticmethod
    def invalidate_cart(cart_id):
        """Invalida cache de carrinho"""
        cache.delete(f'cart:{cart_id}')
    
    @staticmethod
    def clear_all():
        """Limpa todo o cache"""
        cache.clear()
