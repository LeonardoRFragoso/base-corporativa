from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import WishlistCollection, WishlistItem, WishlistNotification, WishlistAnalytics
from .serializers import (
    WishlistCollectionSerializer, WishlistItemSerializer,
    WishlistNotificationSerializer, WishlistAnalyticsSerializer
)
from catalog.models import Product


class WishlistViewSet(viewsets.ModelViewSet):
    """API de Wishlist"""
    serializer_class = WishlistCollectionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WishlistCollection.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Adiciona item à wishlist"""
        collection = self.get_object()
        product_id = request.data.get('product_id')
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Produto não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar se já existe
        if WishlistItem.objects.filter(collection=collection, product=product).exists():
            return Response(
                {'error': 'Produto já está na wishlist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Criar item
        item = WishlistItem.objects.create(
            collection=collection,
            product=product,
            price_when_added=product.price,
            stock_when_added=product.stock,
            priority=request.data.get('priority', 'medium'),
            notes=request.data.get('notes', ''),
            notify_on_sale=request.data.get('notify_on_sale', True),
            notify_on_stock=request.data.get('notify_on_stock', True),
            notify_on_price_drop=request.data.get('notify_on_price_drop', True),
            target_price=request.data.get('target_price')
        )
        
        serializer = WishlistItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'])
    def remove_item(self, request, pk=None):
        """Remove item da wishlist"""
        collection = self.get_object()
        item_id = request.data.get('item_id')
        
        try:
            item = WishlistItem.objects.get(id=item_id, collection=collection)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except WishlistItem.DoesNotExist:
            return Response(
                {'error': 'Item não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'])
    def update_item(self, request, pk=None):
        """Atualiza configurações de um item"""
        collection = self.get_object()
        item_id = request.data.get('item_id')
        
        try:
            item = WishlistItem.objects.get(id=item_id, collection=collection)
            
            # Atualizar campos permitidos
            if 'priority' in request.data:
                item.priority = request.data['priority']
            if 'notes' in request.data:
                item.notes = request.data['notes']
            if 'notify_on_sale' in request.data:
                item.notify_on_sale = request.data['notify_on_sale']
            if 'notify_on_stock' in request.data:
                item.notify_on_stock = request.data['notify_on_stock']
            if 'notify_on_price_drop' in request.data:
                item.notify_on_price_drop = request.data['notify_on_price_drop']
            if 'target_price' in request.data:
                item.target_price = request.data['target_price']
            
            item.save()
            
            serializer = WishlistItemSerializer(item)
            return Response(serializer.data)
        except WishlistItem.DoesNotExist:
            return Response(
                {'error': 'Item não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def default(self, request):
        """Retorna wishlist padrão do usuário"""
        collection = WishlistCollection.objects.filter(
            user=request.user,
            is_default=True
        ).first()
        
        if not collection:
            # Criar wishlist padrão se não existir
            collection = WishlistCollection.objects.create(
                user=request.user,
                name='Minha Lista de Desejos',
                is_default=True
            )
        
        serializer = self.get_serializer(collection)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def shared(self, request):
        """Visualiza wishlist compartilhada"""
        share_token = request.query_params.get('token')
        
        if not share_token:
            return Response(
                {'error': 'Token não fornecido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            collection = WishlistCollection.objects.get(
                share_token=share_token,
                is_public=True
            )
            serializer = self.get_serializer(collection)
            return Response(serializer.data)
        except WishlistCollection.DoesNotExist:
            return Response(
                {'error': 'Wishlist não encontrada ou não é pública'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def notifications(self, request):
        """Lista notificações de wishlist do usuário"""
        collections = WishlistCollection.objects.filter(user=request.user)
        items = WishlistItem.objects.filter(collection__in=collections)
        notifications = WishlistNotification.objects.filter(
            wishlist_item__in=items
        ).order_by('-sent_at')[:50]
        
        serializer = WishlistNotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def trending(self, request):
        """Produtos mais desejados (trending)"""
        analytics = WishlistAnalytics.objects.filter(
            trending_score__gt=0
        ).order_by('-trending_score')[:20]
        
        serializer = WishlistAnalyticsSerializer(analytics, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def most_wanted(self, request):
        """Produtos mais desejados (total)"""
        analytics = WishlistAnalytics.objects.filter(
            total_wishlists__gt=0
        ).order_by('-total_wishlists')[:20]
        
        serializer = WishlistAnalyticsSerializer(analytics, many=True)
        return Response(serializer.data)
