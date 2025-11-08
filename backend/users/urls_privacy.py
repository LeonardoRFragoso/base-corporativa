"""
URLs para endpoints de privacidade e LGPD
Implementa os direitos do titular conforme LGPD Art. 18
"""
from django.urls import path
from . import views_privacy

urlpatterns = [
    # ==================== CONSENTIMENTOS ====================
    # LGPD Art. 7º, I e Art. 8º
    path('consents/', views_privacy.list_consents, name='list_consents'),
    path('consents/create/', views_privacy.create_consent, name='create_consent'),
    path('consents/<str:consent_type>/revoke/', views_privacy.revoke_consent, name='revoke_consent'),
    
    # ==================== EXPORTAÇÃO DE DADOS ====================
    # LGPD Art. 18, II - Acesso aos dados
    # LGPD Art. 18, V - Portabilidade dos dados
    path('data/export/', views_privacy.export_user_data, name='export_user_data'),
    path('data/export/requests/', views_privacy.list_export_requests, name='list_export_requests'),
    
    # ==================== CORREÇÃO DE DADOS ====================
    # LGPD Art. 18, III - Correção de dados
    path('data/update/', views_privacy.update_user_data, name='update_user_data'),
    
    # ==================== EXCLUSÃO DE DADOS ====================
    # LGPD Art. 18, VI - Eliminação dos dados (Direito ao esquecimento)
    path('data/deletion/request/', views_privacy.request_data_deletion, name='request_data_deletion'),
    path('data/deletion/requests/', views_privacy.list_deletion_requests, name='list_deletion_requests'),
    path('data/deletion/requests/<int:request_id>/cancel/', views_privacy.cancel_deletion_request, name='cancel_deletion_request'),
    
    # ==================== INFORMAÇÕES SOBRE TRATAMENTO ====================
    # LGPD Art. 18, I - Confirmação da existência de tratamento
    # LGPD Art. 18, VII - Informação sobre compartilhamento
    path('data/processing-info/', views_privacy.data_processing_info, name='data_processing_info'),
    
    # ==================== ADMIN: PROCESSAR SOLICITAÇÕES ====================
    path('admin/deletion/<int:request_id>/process/', views_privacy.process_deletion_request, name='process_deletion_request'),
    path('admin/deletion/<int:request_id>/complete/', views_privacy.complete_deletion_request, name='complete_deletion_request'),
]
