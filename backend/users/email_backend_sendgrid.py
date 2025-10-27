"""
Backend de email usando SendGrid API
Mantém o email contato@basecorporativa.store para credibilidade
"""
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from email.utils import parseaddr
import logging

logger = logging.getLogger('users')


class SendGridBackend(BaseEmailBackend):
    """
    Backend de email usando SendGrid API
    Emails saem de contato@basecorporativa.store
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = settings.SENDGRID_API_KEY
        self.client = SendGridAPIClient(self.api_key)
    
    def send_messages(self, email_messages):
        """
        Envia emails usando SendGrid mantendo o domínio basecorporativa.store
        """
        if not email_messages:
            return 0
        
        num_sent = 0
        for message in email_messages:
            try:
                # Email sai de contato@basecorporativa.store
                display_name, address = parseaddr(message.from_email or "")
                if not address:
                    address = getattr(settings, 'DEFAULT_FROM_EMAIL', '')
                    display_name, address = parseaddr(address)
                from_email = Email(address, display_name or None)
                to_emails = [To(email) for email in message.to]
                subject = message.subject
                
                # Detectar conteúdo HTML dos alternatives
                html_content = None
                plain_text_content = message.body
                
                if hasattr(message, 'alternatives') and message.alternatives:
                    for content, mimetype in message.alternatives:
                        if mimetype == 'text/html':
                            html_content = content
                            break
                
                # Criar mensagem
                mail = Mail(
                    from_email=from_email,
                    to_emails=to_emails[0] if len(to_emails) == 1 else to_emails,
                    subject=subject,
                    html_content=html_content or plain_text_content,
                    plain_text_content=plain_text_content
                )
                
                # Enviar via SendGrid
                response = self.client.send(mail)
                
                if response.status_code in [200, 201, 202]:
                    num_sent += 1
                    logger.info(f"✅ Email enviado via SendGrid de contato@basecorporativa.store para: {message.to}")
                else:
                    try:
                        body = response.body.decode() if hasattr(response.body, 'decode') else str(response.body)
                    except Exception:
                        body = str(response.body)
                    logger.error(f"❌ Erro SendGrid: Status {response.status_code} Body: {body}")
                    if not self.fail_silently:
                        raise Exception(f"SendGrid returned status {response.status_code}")
                        
            except Exception as e:
                logger.error(f"❌ Erro ao enviar email via SendGrid: {e}")
                if not self.fail_silently:
                    raise
        
        return num_sent
