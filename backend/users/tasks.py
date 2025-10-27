"""
Tasks assíncronas para envio de emails
"""
import threading
from .email_utils import send_verification_email, send_password_reset_email


def send_verification_email_async(user, token):
    """Envia email de verificação em background"""
    def send():
        try:
            send_verification_email(user, token)
            print(f"✅ Email de verificação enviado para: {user.email}")
        except Exception as e:
            print(f"❌ Erro ao enviar email de verificação para {user.email}: {e}")
            import traceback
            traceback.print_exc()
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()


def send_password_reset_email_async(user, token):
    """Envia email de reset de senha em background"""
    def send():
        try:
            send_password_reset_email(user, token)
            print(f"✅ Email de reset enviado para: {user.email}")
        except Exception as e:
            print(f"❌ Erro ao enviar email de reset para {user.email}: {e}")
            import traceback
            traceback.print_exc()
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()
