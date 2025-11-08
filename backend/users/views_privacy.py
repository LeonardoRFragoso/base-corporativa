"""
Views para funcionalidades de privacidade e LGPD
Implementa os direitos do titular (LGPD Art. 18)
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from .models import UserConsent, DataDeletionRequest, DataExportRequest, User
from .serializers_privacy import (
    UserConsentSerializer, ConsentCreateSerializer,
    DataDeletionRequestSerializer, DataExportRequestSerializer,
    UserDataSerializer
)
import json
from datetime import datetime


def get_client_ip(request):
    """Obtém o IP real do cliente"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR', '0.0.0.0')
    return ip


# ==================== CONSENTIMENTOS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_consents(request):
    """
    Lista todos os consentimentos do usuário autenticado
    LGPD Art. 18, I - Confirmação da existência de tratamento
    """
    consents = UserConsent.objects.filter(user=request.user)
    serializer = UserConsentSerializer(consents, many=True)
    return Response({
        'count': consents.count(),
        'consents': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_consent(request):
    """
    Cria ou atualiza um consentimento
    LGPD Art. 7º, I - Mediante consentimento do titular
    """
    serializer = ConsentCreateSerializer(data=request.data)
    if serializer.is_valid():
        consent_type = serializer.validated_data['consent_type']
        consent_given = serializer.validated_data['consent_given']
        version = serializer.validated_data.get('version', '1.0')
        
        # Criar novo consentimento
        consent = UserConsent.objects.create(
            user=request.user,
            consent_type=consent_type,
            consent_given=consent_given,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            version=version
        )
        
        return Response(
            UserConsentSerializer(consent).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_consent(request, consent_type):
    """
    Revoga um consentimento específico
    LGPD Art. 18, IX - Revogação do consentimento
    """
    try:
        # Busca o consentimento ativo mais recente
        consent = UserConsent.objects.filter(
            user=request.user,
            consent_type=consent_type,
            revoked_at__isnull=True
        ).latest('consent_date')
        
        consent.revoke(get_client_ip(request))
        
        return Response({
            'message': f'Consentimento de {consent.get_consent_type_display()} revogado com sucesso.',
            'consent': UserConsentSerializer(consent).data
        })
    
    except UserConsent.DoesNotExist:
        return Response(
            {'error': 'Consentimento não encontrado ou já revogado.'},
            status=status.HTTP_404_NOT_FOUND
        )


# ==================== EXPORTAÇÃO DE DADOS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_user_data(request):
    """
    Exporta todos os dados do usuário em formato JSON
    LGPD Art. 18, II - Acesso aos dados
    LGPD Art. 18, V - Portabilidade dos dados
    """
    # Criar solicitação de exportação
    export_request = DataExportRequest.objects.create(
        user=request.user,
        ip_address=get_client_ip(request),
        status='processing'
    )
    
    try:
        # Serializar todos os dados do usuário
        serializer = UserDataSerializer(request.user)
        user_data = serializer.data
        
        # Adicionar metadados
        export_data = {
            'export_date': timezone.now().isoformat(),
            'user_data': user_data,
            'lgpd_notice': 'Estes são todos os seus dados pessoais armazenados conforme LGPD (Lei 13.709/2018)',
        }
        
        # Marcar como concluído
        export_request.status = 'completed'
        export_request.completed_date = timezone.now()
        export_request.save()
        
        # Retornar JSON
        response = HttpResponse(
            json.dumps(export_data, indent=2, ensure_ascii=False),
            content_type='application/json'
        )
        response['Content-Disposition'] = f'attachment; filename="meus_dados_{request.user.username}_{datetime.now().strftime("%Y%m%d")}.json"'
        
        return response
    
    except Exception as e:
        export_request.status = 'failed'
        export_request.save()
        return Response(
            {'error': f'Erro ao exportar dados: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_export_requests(request):
    """
    Lista todas as solicitações de exportação do usuário
    """
    requests_list = DataExportRequest.objects.filter(user=request.user)
    serializer = DataExportRequestSerializer(requests_list, many=True)
    return Response({
        'count': requests_list.count(),
        'requests': serializer.data
    })


# ==================== CORREÇÃO DE DADOS ====================

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_data(request):
    """
    Permite ao usuário corrigir seus dados pessoais
    LGPD Art. 18, III - Correção de dados incompletos, inexatos ou desatualizados
    """
    user = request.user
    allowed_fields = ['first_name', 'last_name', 'email']
    
    updated_fields = []
    for field in allowed_fields:
        if field in request.data:
            setattr(user, field, request.data[field])
            updated_fields.append(field)
    
    if updated_fields:
        user.save()
        return Response({
            'message': 'Dados atualizados com sucesso.',
            'updated_fields': updated_fields,
            'user': {
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })
    
    return Response(
        {'error': 'Nenhum campo válido para atualizar.'},
        status=status.HTTP_400_BAD_REQUEST
    )


# ==================== EXCLUSÃO DE DADOS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_data_deletion(request):
    """
    Solicita a exclusão de todos os dados do usuário
    LGPD Art. 18, VI - Eliminação dos dados pessoais tratados com consentimento
    Direito ao esquecimento
    """
    # Verificar se já existe uma solicitação pendente
    pending_request = DataDeletionRequest.objects.filter(
        user=request.user,
        status__in=['pending', 'processing']
    ).first()
    
    if pending_request:
        return Response({
            'message': 'Você já possui uma solicitação de exclusão pendente.',
            'request': DataDeletionRequestSerializer(pending_request).data
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Criar nova solicitação
    deletion_request = DataDeletionRequest.objects.create(
        user=request.user,
        ip_address=get_client_ip(request),
        reason=request.data.get('reason', ''),
        status='pending'
    )
    
    return Response({
        'message': 'Solicitação de exclusão criada com sucesso. Processaremos em até 15 dias conforme LGPD.',
        'request': DataDeletionRequestSerializer(deletion_request).data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_deletion_requests(request):
    """
    Lista todas as solicitações de exclusão do usuário
    """
    requests_list = DataDeletionRequest.objects.filter(user=request.user)
    serializer = DataDeletionRequestSerializer(requests_list, many=True)
    return Response({
        'count': requests_list.count(),
        'requests': serializer.data
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_deletion_request(request, request_id):
    """
    Cancela uma solicitação de exclusão pendente
    """
    try:
        deletion_request = DataDeletionRequest.objects.get(
            id=request_id,
            user=request.user,
            status='pending'
        )
        
        deletion_request.status = 'cancelled'
        deletion_request.processed_date = timezone.now()
        deletion_request.save()
        
        return Response({
            'message': 'Solicitação de exclusão cancelada com sucesso.'
        })
    
    except DataDeletionRequest.DoesNotExist:
        return Response(
            {'error': 'Solicitação não encontrada ou não pode ser cancelada.'},
            status=status.HTTP_404_NOT_FOUND
        )


# ==================== INFORMAÇÕES SOBRE TRATAMENTO ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def data_processing_info(request):
    """
    Retorna informações sobre como os dados do usuário são tratados
    LGPD Art. 18, I - Confirmação da existência de tratamento
    LGPD Art. 18, VII - Informação sobre compartilhamento
    """
    return Response({
        'user': request.user.username,
        'data_collected': {
            'personal': ['Nome', 'E-mail', 'Telefone', 'CPF (opcional)'],
            'address': ['Endereço completo de entrega'],
            'transactional': ['Histórico de pedidos', 'Métodos de pagamento (sem dados completos de cartão)'],
            'behavioral': ['Produtos visualizados', 'Itens no carrinho', 'Lista de desejos'],
            'technical': ['Endereço IP', 'Cookies', 'Tipo de navegador'],
        },
        'purposes': {
            'contract_execution': 'Processar e entregar pedidos',
            'legitimate_interest': 'Prevenir fraudes e melhorar serviços',
            'consent': 'Enviar comunicações de marketing (se consentido)',
            'legal_obligation': 'Cumprir obrigações fiscais e contábeis',
        },
        'data_sharing': {
            'payment_processor': 'Mercado Pago - Para processar pagamentos',
            'shipping': 'Melhor Envio - Para calcular e realizar entregas',
            'hosting': 'Railway, Cloudflare R2 - Hospedagem e armazenamento',
        },
        'retention_period': {
            'account_data': 'Enquanto a conta estiver ativa',
            'transaction_data': '5 anos (obrigação fiscal)',
            'marketing_data': 'Até revogação do consentimento',
            'access_logs': '6 meses (Marco Civil da Internet)',
        },
        'your_rights': [
            'Confirmar existência de tratamento',
            'Acessar seus dados',
            'Corrigir dados incompletos ou inexatos',
            'Solicitar anonimização, bloqueio ou eliminação',
            'Portabilidade dos dados',
            'Revogar consentimento',
            'Opor-se ao tratamento',
        ],
        'contact': {
            'email': 'privacidade@basecorporativa.com',
            'dpo': '[Nome do DPO]',
        },
        'anpd': 'Você pode apresentar reclamação à ANPD em www.gov.br/anpd',
    })


# ==================== ADMIN: PROCESSAR SOLICITAÇÕES ====================

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def process_deletion_request(request, request_id):
    """
    [ADMIN] Processa uma solicitação de exclusão de dados
    Apenas administradores podem executar
    """
    try:
        deletion_request = DataDeletionRequest.objects.get(id=request_id)
        
        if deletion_request.status != 'pending':
            return Response(
                {'error': 'Esta solicitação já foi processada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Marcar como processando
        deletion_request.status = 'processing'
        deletion_request.save()
        
        # Aqui você implementaria a lógica real de exclusão
        # Por segurança, não vamos deletar automaticamente
        # Requer confirmação manual e backup
        
        return Response({
            'message': 'Solicitação marcada como em processamento.',
            'request': DataDeletionRequestSerializer(deletion_request).data,
            'next_steps': [
                '1. Fazer backup dos dados do usuário',
                '2. Verificar obrigações legais de retenção',
                '3. Anonimizar ou excluir dados conforme apropriado',
                '4. Marcar como concluído usando PATCH /api/privacy/admin/deletion/{id}/complete/',
            ]
        })
    
    except DataDeletionRequest.DoesNotExist:
        return Response(
            {'error': 'Solicitação não encontrada.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([permissions.IsAdminUser])
def complete_deletion_request(request, request_id):
    """
    [ADMIN] Marca uma solicitação de exclusão como concluída
    """
    try:
        deletion_request = DataDeletionRequest.objects.get(id=request_id)
        deletion_request.complete(processed_by=request.user)
        
        return Response({
            'message': 'Solicitação de exclusão marcada como concluída.',
            'request': DataDeletionRequestSerializer(deletion_request).data
        })
    
    except DataDeletionRequest.DoesNotExist:
        return Response(
            {'error': 'Solicitação não encontrada.'},
            status=status.HTTP_404_NOT_FOUND
        )
