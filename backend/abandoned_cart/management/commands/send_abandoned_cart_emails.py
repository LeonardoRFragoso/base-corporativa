from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from datetime import timedelta
from abandoned_cart.models import AbandonedCart
from discounts.models import DiscountCode
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Envia e-mails para carrinhos abandonados'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Executa sem enviar e-mails (apenas log)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        now = timezone.now()
        
        # Sequência de e-mails
        sequences = [
            {'hours': 1, 'sequence': 1, 'subject': '🛒 Você esqueceu algo no carrinho!'},
            {'hours': 24, 'sequence': 2, 'subject': '⏰ Seu carrinho ainda está esperando + 10% OFF'},
            {'hours': 72, 'sequence': 3, 'subject': '🎁 Última chance: 15% OFF no seu carrinho!'},
        ]
        
        total_sent = 0
        
        for seq_config in sequences:
            # Buscar carrinhos no tempo apropriado
            time_threshold = now - timedelta(hours=seq_config['hours'])
            time_window_start = time_threshold - timedelta(minutes=30)  # Janela de 30 min
            
            carts = AbandonedCart.objects.filter(
                created_at__gte=time_window_start,
                created_at__lte=time_threshold,
                email_sent_count=seq_config['sequence'] - 1,  # Ainda não enviou este e-mail
                recovered=False
            ).select_related('user')
            
            for cart in carts:
                try:
                    # Gerar cupom de desconto
                    discount_code = None
                    discount_percent = 0
                    
                    if seq_config['sequence'] == 2:
                        discount_percent = 10
                    elif seq_config['sequence'] == 3:
                        discount_percent = 15
                    
                    if discount_percent > 0:
                        # Criar cupom único para o cliente
                        code = f'VOLTE{discount_percent}-{cart.id}'
                        discount_code, created = DiscountCode.objects.get_or_create(
                            code=code,
                            defaults={
                                'percent_off': discount_percent,
                                'active': True,
                                'valid_from': now,
                                'valid_until': now + timedelta(days=7),
                                'usage_limit': 1,
                                'times_used': 0
                            }
                        )
                    
                    # Preparar contexto do e-mail
                    email_context = {
                        'cart': cart,
                        'discount_code': discount_code.code if discount_code else None,
                        'discount_percent': discount_percent,
                        'frontend_url': settings.FRONTEND_BASE_URL,
                        'sequence': seq_config['sequence'],
                    }
                    
                    # Renderizar template
                    html_message = render_to_string(
                        f'abandoned_cart/email_sequence_{seq_config["sequence"]}.html',
                        email_context
                    )
                    
                    text_message = render_to_string(
                        f'abandoned_cart/email_sequence_{seq_config["sequence"]}.txt',
                        email_context
                    )
                    
                    # Enviar e-mail
                    if not dry_run:
                        recipient_email = cart.email or (cart.user.email if cart.user else None)
                        
                        if recipient_email:
                            send_mail(
                                subject=seq_config['subject'],
                                message=text_message,
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                recipient_list=[recipient_email],
                                html_message=html_message,
                                fail_silently=False,
                            )
                            
                            # Atualizar contador
                            cart.email_sent_count = seq_config['sequence']
                            cart.last_email_sent_at = now
                            cart.save()
                            
                            total_sent += 1
                            logger.info(f'E-mail enviado para {recipient_email} (sequência {seq_config["sequence"]})')
                        else:
                            logger.warning(f'Carrinho {cart.id} sem e-mail válido')
                    else:
                        logger.info(f'[DRY RUN] E-mail seria enviado para carrinho {cart.id} (sequência {seq_config["sequence"]})')
                        total_sent += 1
                
                except Exception as e:
                    logger.error(f'Erro ao enviar e-mail para carrinho {cart.id}: {str(e)}')
                    continue
        
        message = f'Total de e-mails {"simulados" if dry_run else "enviados"}: {total_sent}'
        self.stdout.write(self.style.SUCCESS(message))
        logger.info(message)
