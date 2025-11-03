from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """Lista notificações do usuário logado"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """Retorna contagem de notificações não lidas"""
    count = Notification.objects.filter(user=request.user, read=False).count()
    return Response({'count': count})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_as_read(request, pk):
    """Marca uma notificação como lida"""
    try:
        notification = Notification.objects.get(pk=pk, user=request.user)
        notification.read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)
    except Notification.DoesNotExist:
        return Response({'error': 'Notificação não encontrada'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_as_read(request):
    """Marca todas as notificações do usuário como lidas"""
    updated = Notification.objects.filter(user=request.user, read=False).update(read=True)
    return Response({'updated': updated, 'message': f'{updated} notificação(ões) marcada(s) como lida(s)'})


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_notification(request, pk):
    """Deleta uma notificação"""
    try:
        notification = Notification.objects.get(pk=pk, user=request.user)
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Notification.DoesNotExist:
        return Response({'error': 'Notificação não encontrada'}, status=status.HTTP_404_NOT_FOUND)
