import logging
import traceback
from django.http import JsonResponse
from django.conf import settings

logger = logging.getLogger(__name__)

class DebugErrorMiddleware:
    """
    Middleware temporário para capturar erros 500 e retornar detalhes em JSON
    quando DEBUG=False. Remove após resolver os problemas de storage.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """
        Captura exceções não tratadas e retorna JSON com detalhes do erro
        """
        if request.path.startswith('/api/'):
            error_details = {
                'error': 'Internal Server Error',
                'type': type(exception).__name__,
                'message': str(exception),
                'path': request.path,
                'method': request.method,
            }
            
            # Em desenvolvimento ou para admin, inclui traceback
            if settings.DEBUG or (hasattr(request, 'user') and request.user.is_staff):
                error_details['traceback'] = traceback.format_exc()
                error_details['storage_backend'] = getattr(settings, 'DEFAULT_FILE_STORAGE', 'default')
            
            # Log do erro
            logger.error(f"API Error in {request.method} {request.path}: {exception}", 
                        exc_info=True)
            
            return JsonResponse(error_details, status=500)
        
        # Para não-API, deixa o Django tratar normalmente
        return None
