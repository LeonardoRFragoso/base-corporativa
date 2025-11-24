from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


def send_welcome_email(email):
    """
    Envia email de boas-vindas para novo inscrito na newsletter.
    
    Args:
        email (str): Email do inscrito
        
    Returns:
        bool: True se o email foi enviado com sucesso, False caso contrário
    """
    subject = '🎉 Bem-vindo à Newsletter - Ganhe 10% OFF na Primeira Compra!'
    
    # HTML content
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #b8860b 0%, #daa520 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .discount-code {{ background: #fff3cd; border: 2px dashed #b8860b; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }}
            .discount-code h2 {{ color: #b8860b; margin: 0; font-size: 32px; }}
            .benefits {{ background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }}
            .benefit-item {{ display: flex; align-items: center; margin: 10px 0; }}
            .benefit-icon {{ font-size: 24px; margin-right: 10px; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            .button {{ display: inline-block; background: #b8860b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Bem-vindo à BASE CORPORATIVA!</h1>
                <p>Obrigado por se inscrever em nossa newsletter</p>
            </div>
            <div class="content">
                <p>Olá,</p>
                <p>É um prazer recebê-lo(a) em nossa comunidade! Como agradecimento pela sua inscrição, preparamos um presente especial:</p>
                
                <div class="discount-code">
                    <h2>10% OFF</h2>
                    <p><strong>Na sua primeira compra!</strong></p>
                    <p style="color: #666; font-size: 14px;">O desconto será aplicado automaticamente no checkout</p>
                </div>
                
                <div class="benefits">
                    <h3>O que você receberá:</h3>
                    <div class="benefit-item">
                        <span class="benefit-icon">🎁</span>
                        <span><strong>Ofertas Exclusivas:</strong> Descontos e promoções especiais para assinantes</span>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">🚀</span>
                        <span><strong>Lançamentos:</strong> Seja o primeiro a conhecer nossos novos produtos</span>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">💼</span>
                        <span><strong>Dicas de Estilo:</strong> Conselhos profissionais de moda corporativa</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="{settings.FRONTEND_BASE_URL}" class="button">Começar a Comprar</a>
                </div>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    <em>Seus dados estão seguros. Enviamos apenas conteúdo relevante. Cancele quando quiser.</em>
                </p>
            </div>
            <div class="footer">
                <p>BASE CORPORATIVA - Estilo Profissional</p>
                <p>Se você não se inscreveu em nossa newsletter, pode ignorar este email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text fallback
    plain_message = f"""
    Bem-vindo à BASE CORPORATIVA!
    
    Obrigado por se inscrever em nossa newsletter!
    
    Como agradecimento, você ganhou 10% OFF na sua primeira compra!
    O desconto será aplicado automaticamente no checkout.
    
    O que você receberá:
    
    🎁 Ofertas Exclusivas: Descontos e promoções especiais para assinantes
    🚀 Lançamentos: Seja o primeiro a conhecer nossos novos produtos
    💼 Dicas de Estilo: Conselhos profissionais de moda corporativa
    
    Visite nossa loja: {settings.FRONTEND_BASE_URL}
    
    Seus dados estão seguros. Enviamos apenas conteúdo relevante.
    Cancele quando quiser.
    
    BASE CORPORATIVA - Estilo Profissional
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Email de boas-vindas enviado com sucesso para {email}")
        return True
    except Exception as e:
        logger.error(f"Erro ao enviar email para {email}: {str(e)}")
        return False
