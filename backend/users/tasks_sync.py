"""
Versão SÍNCRONA para debug - usar temporariamente
"""
import logging
from .email_utils import send_verification_email, send_password_reset_email

logger = logging.getLogger('users')


def send_verification_email_sync(user, token):
    """Envia email de verificação SINCRONAMENTE (para debug)"""
    try:
        logger.info(f"🔄 Iniciando envio SÍNCRONO de email de verificação para: {user.email}")
        print(f"🔄 Iniciando envio SÍNCRONO de email de verificação para: {user.email}")
        
        send_verification_email(user, token)
        
        logger.info(f"✅ Email de verificação enviado com sucesso para: {user.email}")
        print(f"✅ Email de verificação enviado com sucesso para: {user.email}")
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email de verificação para {user.email}: {e}", exc_info=True)
        print(f"❌ Erro ao enviar email de verificação para {user.email}: {e}")
        import traceback
        traceback.print_exc()
        raise  # Re-raise para ver o erro completo


def send_password_reset_email_sync(user, token):
    """Envia email de reset SINCRONAMENTE (para debug)"""
    try:
        logger.info(f"🔄 Iniciando envio SÍNCRONO de email de reset para: {user.email}")
        print(f"🔄 Iniciando envio SÍNCRONO de email de reset para: {user.email}")
        
        send_password_reset_email(user, token)
        
        logger.info(f"✅ Email de reset enviado com sucesso para: {user.email}")
        print(f"✅ Email de reset enviado com sucesso para: {user.email}")
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email de reset para {user.email}: {e}", exc_info=True)
        print(f"❌ Erro ao enviar email de reset para {user.email}: {e}")
        import traceback
        traceback.print_exc()
        raise
