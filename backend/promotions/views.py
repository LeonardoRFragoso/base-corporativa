from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import FlashSale
from .serializers import FlashSaleSerializer


class FlashSaleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para visualização de ofertas relâmpago.
    Apenas leitura - criação/edição via Django Admin.
    """
    queryset = FlashSale.objects.all()
    serializer_class = FlashSaleSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Retorna apenas ofertas ativas"""
        return FlashSale.objects.filter(is_active=True).order_by('-start_time')
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Retorna apenas ofertas que estão ao vivo no momento.
        Endpoint: /api/flash-sales/active/
        """
        now = timezone.now()
        active_sales = FlashSale.objects.filter(
            is_active=True,
            start_time__lte=now,
            end_time__gte=now
        ).order_by('-start_time')
        
        serializer = self.get_serializer(active_sales, many=True)
        return Response(serializer.data)
