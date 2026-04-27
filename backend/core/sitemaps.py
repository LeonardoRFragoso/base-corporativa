"""
Sitemap dinâmico para SEO
Gera sitemap.xml automaticamente com produtos, categorias e páginas estáticas
"""
from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from catalog.models import Product, Category


class StaticViewSitemap(Sitemap):
    """Páginas estáticas do site"""
    priority = 0.8
    changefreq = 'weekly'

    def items(self):
        return [
            'home',
            'catalog',
            'about',
            'contact',
            'size-guide',
            'shipping',
            'returns',
            'faq',
            'privacy',
            'terms',
            'cookies',
        ]

    def location(self, item):
        if item == 'home':
            return '/'
        return f'/{item}'


class ProductSitemap(Sitemap):
    """Sitemap de produtos"""
    changefreq = "weekly"
    priority = 0.9

    def items(self):
        return Product.objects.filter(is_active=True).order_by('-created_at')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        # Usar slug quando implementado, por enquanto ID
        return f'/product/{obj.id}'


class CategorySitemap(Sitemap):
    """Sitemap de categorias"""
    changefreq = "monthly"
    priority = 0.7

    def items(self):
        return Category.objects.filter(is_active=True).order_by('name')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        # Usar slug quando implementado
        return f'/catalog?category={obj.id}'


# Dicionário de sitemaps para usar no urls.py
sitemaps = {
    'static': StaticViewSitemap,
    'products': ProductSitemap,
    'categories': CategorySitemap,
}
