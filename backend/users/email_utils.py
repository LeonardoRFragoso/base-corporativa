from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags


def send_verification_email(user, token):
    """Envia email de verificação para o usuário"""
    verification_url = f"{settings.FRONTEND_BASE_URL}/verificar-email/{token}"
    
    subject = 'Confirme seu email - BASE CORPORATIVA'
    
    html_content = render_to_string('users/emails/email_verification.html', {
        'user': user,
        'verification_url': verification_url,
    })
    
    text_content = strip_tags(html_content)
    
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
        reply_to=[settings.DEFAULT_FROM_EMAIL]
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=False)


def send_password_reset_email(user, token):
    """Envia email de reset de senha para o usuário"""
    reset_url = f"{settings.FRONTEND_BASE_URL}/redefinir-senha/{token}"
    
    subject = 'Redefinir senha - BASE CORPORATIVA'
    
    html_content = render_to_string('users/emails/password_reset.html', {
        'user': user,
        'reset_url': reset_url,
    })
    
    text_content = strip_tags(html_content)
    
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
        reply_to=[settings.DEFAULT_FROM_EMAIL]
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=False)
