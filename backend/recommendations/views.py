from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import ProductView, ProductRecommendation, UserRecommendation
from .services import RecommendationEngine
from catalog.serializers import ProductSerializer
from catalog.models import Product


class RecommendationViewSet(viewsets.ViewSet):
    """API de recomendações de produtos"""
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def track_view(self, request):
        """Registra visualização de produto"""
        product_id = request.data.get('product_id')
        
        try:
            product = Product.objects.get(id=product_id)
            user = request.user if request.user.is_authenticated else None
            session_id = request.session.session_key
            
            RecommendationEngine.track_view(product, user, session_id)
            
            return Response({'status': 'tracked'}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Produto não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def also_bought(self, request):
        """Produtos frequentemente comprados juntos"""
        product_id = request.query_params.get('product_id')
        
        try:
            product = Product.objects.get(id=product_id)
            recommendations = RecommendationEngine.get_also_bought(product)
            serializer = ProductSerializer(recommendations, many=True)
            
            return Response({
                'title': 'Quem comprou este produto também comprou',
                'products': serializer.data
            })
        except Product.DoesNotExist:
            return Response(
                {'error': 'Produto não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def related(self, request):
        """Produtos relacionados por categoria"""
        product_id = request.query_params.get('product_id')
        
        try:
            product = Product.objects.get(id=product_id)
            recommendations = RecommendationEngine.get_related_by_category(product)
            serializer = ProductSerializer(recommendations, many=True)
            
            return Response({
                'title': 'Produtos relacionados',
                'products': serializer.data
            })
        except Product.DoesNotExist:
            return Response(
                {'error': 'Produto não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def for_you(self, request):
        """Recomendações personalizadas para o usuário"""
        recommendations = RecommendationEngine.get_user_recommendations(request.user)
        serializer = ProductSerializer(recommendations, many=True)
        
        return Response({
            'title': 'Recomendado para você',
            'products': serializer.data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def trending(self, request):
        """Produtos em alta"""
        trending = RecommendationEngine.get_trending_products()
        serializer = ProductSerializer(trending, many=True)
        
        return Response({
            'title': 'Produtos em alta',
            'products': serializer.data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def checkout_suggestions(self, request):
        """Sugestões para o checkout baseadas no carrinho"""
        cart_product_ids = request.query_params.getlist('product_ids[]')
        
        if not cart_product_ids:
            return Response({'products': []})
        
        # Buscar produtos relacionados aos itens do carrinho
        suggestions = []
        seen = set()
        
        for product_id in cart_product_ids[:3]:  # Limitar a 3 produtos do carrinho
            try:
                product = Product.objects.get(id=product_id)
                also_bought = RecommendationEngine.get_also_bought(product, limit=3)
                
                for rec_product in also_bought:
                    if rec_product.id not in seen and str(rec_product.id) not in cart_product_ids:
                        seen.add(rec_product.id)
                        suggestions.append(rec_product)
                        
                        if len(suggestions) >= 6:
                            break
            except Product.DoesNotExist:
                continue
            
            if len(suggestions) >= 6:
                break
        
        serializer = ProductSerializer(suggestions, many=True)
        
        return Response({
            'title': 'Complete sua compra',
            'products': serializer.data
        })
