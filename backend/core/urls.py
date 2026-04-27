"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse, HttpResponse
from django.contrib.sitemaps.views import sitemap
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from users.views import EmailOrUsernameTokenObtainPairView
from .sitemaps import sitemaps

def root_health(_request):
    return JsonResponse({
        "status": "ok",
        "service": "Minimalist Workwear API",
        "version": "v1"
    })

def robots_txt(request):
    """Gera robots.txt dinamicamente"""
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin/",
        "Disallow: /api/auth/",
        "Disallow: /api/user/",
        "Disallow: /api/cart/",
        "Disallow: /api/orders/",
        "Disallow: /api/payments/",
        "",
        f"Sitemap: {request.build_absolute_uri('/sitemap.xml')}",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', root_health, name='root'),
    
    # SEO - Sitemap e Robots
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', robots_txt, name='robots_txt'),
    
    # Auth
    path('api/auth/login/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Routes
    path('api/', include('users.urls')),
    path('api/', include('catalog.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/shipping/', include('shipping.urls')),
    path('api/', include('newsletter.urls')),
    path('api/user/addresses/', include('addresses.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/discounts/', include('discounts.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/', include('recommendations.urls')),
    path('api/', include('giftcards.urls')),
    path('api/wishlist/', include('wishlist.urls')),
    path('api/', include('promotions.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
