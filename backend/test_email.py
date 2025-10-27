"""
Script para testar o envio de email via Hostinger
Execute: python test_email.py
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email():
    print("🔧 Testando configuração de email...")
    print(f"📧 Host: {settings.EMAIL_HOST}")
    print(f"📧 Port: {settings.EMAIL_PORT}")
    print(f"📧 User: {settings.EMAIL_HOST_USER}")
    print(f"📧 From: {settings.DEFAULT_FROM_EMAIL}")
    print(f"📧 SSL: {settings.EMAIL_USE_SSL}")
    print()
    
    try:
        print("📤 Enviando email de teste...")
        test_recipient = 'leonardorfragoso@gmail.com'  # Email do admin
        send_mail(
            subject='Teste de Email - BASE CORPORATIVA',
            message='Este é um email de teste do sistema de autenticação da BASE CORPORATIVA.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[test_recipient],
            fail_silently=False,
        )
        print("✅ Email enviado com sucesso!")
        print(f"📬 Verifique a caixa de entrada de: {test_recipient}")
    except Exception as e:
        print(f"❌ Erro ao enviar email: {e}")
        print("\n🔍 Verifique:")
        print("  1. Senha do email está correta")
        print("  2. Servidor SMTP da Hostinger está acessível")
        print("  3. Porta 465 não está bloqueada pelo firewall")

if __name__ == '__main__':
    test_email()
