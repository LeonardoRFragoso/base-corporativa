"""
Tasks assíncronas para envio de emails
"""
import threading
import logging
from .email_utils import send_verification_email, send_password_reset_email

logger = logging.getLogger('users')


def send_verification_email_async(user, token):
    """Envia email de verificação em background"""
    def send():
        try:
            logger.info(f"🔄 Iniciando envio de email de verificação para: {user.email}")
            send_verification_email(user, token)
            logger.info(f"✅ Email de verificação enviado com sucesso para: {user.email}")
            print(f"✅ Email de verificação enviado para: {user.email}")
        except Exception as e:
            logger.error(f"❌ Erro ao enviar email de verificação para {user.email}: {e}", exc_info=True)
            print(f"❌ Erro ao enviar email de verificação para {user.email}: {e}")
            import traceback
            traceback.print_exc()
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()
    logger.info(f"🚀 Thread de envio de email iniciada para: {user.email}")


def send_password_reset_email_async(user, token):
    """Envia email de reset de senha em background"""
    def send():
        try:
            logger.info(f"🔄 Iniciando envio de email de reset para: {user.email}")
            send_password_reset_email(user, token)
            logger.info(f"✅ Email de reset enviado com sucesso para: {user.email}")
            print(f"✅ Email de reset enviado para: {user.email}")
        except Exception as e:
            logger.error(f"❌ Erro ao enviar email de reset para {user.email}: {e}", exc_info=True)
            print(f"❌ Erro ao enviar email de reset para {user.email}: {e}")
            import traceback
            traceback.print_exc()
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()
    logger.info(f"🚀 Thread de envio de email iniciada para: {user.email}")
