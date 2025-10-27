"""
Script para testar envio de email de verificação para um usuário específico
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import EmailVerificationToken
from users.email_utils import send_verification_email

User = get_user_model()

# Buscar o usuário "leonardo.fragoso"
try:
    user = User.objects.get(username='leonardo.fragoso')
    print(f"✅ Usuário encontrado: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Email verificado: {user.email_verified}")
    print()
    
    # Invalidar tokens antigos
    EmailVerificationToken.objects.filter(user=user, used=False).update(used=True)
    print("🔄 Tokens antigos invalidados")
    
    # Criar novo token
    token = EmailVerificationToken.objects.create(user=user)
    print(f"✅ Novo token criado: {token.token}")
    print(f"   Expira em: {token.expires_at}")
    print()
    
    # Tentar enviar email
    print("📤 Tentando enviar email...")
    try:
        send_verification_email(user, token.token)
        print("✅ Email enviado com sucesso!")
        print(f"📬 Verifique a caixa de entrada de: {user.email}")
    except Exception as e:
        print(f"❌ Erro ao enviar email: {e}")
        import traceback
        traceback.print_exc()
        
except User.DoesNotExist:
    print("❌ Usuário 'leonardo.fragoso' não encontrado")
    print("\nUsuários disponíveis:")
    for u in User.objects.all():
        print(f"  - {u.username} ({u.email}) - Verificado: {u.email_verified}")
