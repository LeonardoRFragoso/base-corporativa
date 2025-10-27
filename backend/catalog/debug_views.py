from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Product
from .serializers import ProductWriteSerializer
import traceback
from django.conf import settings


@api_view(['PUT', 'POST'])
@permission_classes([IsAdminUser])
def debug_product_update(request, pk=None):
    """
    Debug endpoint para testar edição de produto com erro detalhado.
    PUT /api/debug/product-update/{id}/ - simula edição
    POST /api/debug/product-update/ - testa serializer sem salvar
    """
    try:
        if pk:
            product = get_object_or_404(Product, pk=pk)
            serializer = ProductWriteSerializer(product, data=request.data, partial=True)
        else:
            serializer = ProductWriteSerializer(data=request.data)
        
        # Teste de validação
        if not serializer.is_valid():
            return Response({
                'debug': 'Validation failed',
                'errors': serializer.errors,
                'data_received': request.data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Se chegou até aqui, a validação passou
        if request.method == 'POST':
            return Response({
                'debug': 'Validation passed (not saved)',
                'validated_data': serializer.validated_data,
                'data_received': request.data
            })
        
        # Para PUT, tenta salvar
        updated_product = serializer.save()
        return Response({
            'debug': 'Update successful',
            'product_id': updated_product.id,
            'product_name': updated_product.name
        })
        
    except Exception as e:
        return Response({
            'debug': 'Exception occurred',
            'error_type': type(e).__name__,
            'error_message': str(e),
            'traceback': traceback.format_exc(),
            'data_received': request.data,
            'storage_backend': getattr(settings, 'DEFAULT_FILE_STORAGE', 'default'),
            'media_url': settings.MEDIA_URL
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def debug_product_delete(request, pk):
    """
    Debug endpoint para testar deleção de produto com erro detalhado.
    DELETE /api/debug/product-delete/{id}/
    """
    try:
        from .models import ProductImage
        
        product = get_object_or_404(Product, pk=pk)
        
        # Lista imagens antes de deletar
        images_info = []
        for img in product.images.all():
            images_info.append({
                'id': img.id,
                'image_url': str(img.image),
                'image_name': img.image.name if img.image else 'No file'
            })
        
        # Tenta deletar o produto (isso deve deletar imagens em cascade)
        product_name = product.name
        product.delete()
        
        return Response({
            'debug': 'Delete successful',
            'deleted_product': product_name,
            'deleted_images': images_info
        })
        
    except Exception as e:
        return Response({
            'debug': 'Exception occurred during delete',
            'error_type': type(e).__name__,
            'error_message': str(e),
            'traceback': traceback.format_exc(),
            'storage_backend': getattr(settings, 'DEFAULT_FILE_STORAGE', 'default'),
            'media_url': settings.MEDIA_URL
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def debug_storage_info(request):
    """
    Retorna informações sobre configuração de storage atual.
    GET /api/debug/storage/
    """
    return Response({
        'default_file_storage': getattr(settings, 'DEFAULT_FILE_STORAGE', 'django.core.files.storage.FileSystemStorage'),
        'media_url': settings.MEDIA_URL,
        'media_root': str(getattr(settings, 'MEDIA_ROOT', 'Not set')),
        'aws_storage_bucket': getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'Not set'),
        'aws_s3_endpoint': getattr(settings, 'AWS_S3_ENDPOINT_URL', 'Not set'),
        'aws_s3_custom_domain': getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', 'Not set'),
        'debug_mode': settings.DEBUG
    })
