from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from .models import AbandonedCart, AbandonedCartMetrics
from discounts.models import Coupon
from datetime import timedelta
import random
import string


class AbandonedCartService:
    """Serviço para gerenciar carrinhos abandonados"""
    
    @staticmethod
    def create_abandoned_cart(user, cart_data, total_value):
        """Cria registro de carrinho abandonado"""
        # Verificar se já existe carrinho ativo para este usuário
        existing = AbandonedCart.objects.filter(
            user=user,
            status='active'
        ).first()
        
        if existing:
            # Atualizar existente
            existing.cart_data = cart_data
            existing.total_value = total_value
            existing.updated_at = timezone.now()
            existing.save()
            return existing
        
        # Criar novo
        return AbandonedCart.objects.create(
            user=user,
            cart_data=cart_data,
            total_value=total_value
        )
    
    @staticmethod
    def generate_recovery_coupon(discount_percentage):
        """Gera cupom de recuperação"""
        code = 'VOLTA' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        coupon = Coupon.objects.create(
            code=code,
            discount_type='percentage',
            discount_value=discount_percentage,
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=7),
            usage_limit=1,
            is_active=True
        )
        
        return coupon.code
    
    @staticmethod
    def send_first_email(abandoned_cart):
        """Envia primeiro email de recuperação (1 hora) - 5% desconto"""
        if abandoned_cart.first_email_sent:
            return False
        
        # Gerar cupom
        coupon_code = AbandonedCartService.generate_recovery_coupon(5)
        abandoned_cart.recovery_coupon_1h = coupon_code
        abandoned_cart.first_email_sent = timezone.now()
        abandoned_cart.save()
        
        # Enviar email
        subject = f"🛒 Você esqueceu algo no carrinho, {abandoned_cart.user.first_name}!"
        
        context = {
            'user': abandoned_cart.user,
            'cart': abandoned_cart,
            'coupon_code': coupon_code,
            'discount': 5,
            'recovery_link': f"{settings.FRONTEND_BASE_URL}/cart?recovery={abandoned_cart.id}"
        }
        
        html_message = render_to_string('abandoned_cart/email_1h.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [abandoned_cart.user.email],
            html_message=html_message,
            fail_silently=True
        )
        
        return True
    
    @staticmethod
    def send_second_email(abandoned_cart):
        """Envia segundo email de recuperação (24 horas) - 10% desconto"""
        if abandoned_cart.second_email_sent:
            return False
        
        # Gerar cupom
        coupon_code = AbandonedCartService.generate_recovery_coupon(10)
        abandoned_cart.recovery_coupon_24h = coupon_code
        abandoned_cart.second_email_sent = timezone.now()
        abandoned_cart.save()
        
        # Enviar email
        subject = f"⏰ Última chance! 10% OFF no seu carrinho"
        
        context = {
            'user': abandoned_cart.user,
            'cart': abandoned_cart,
            'coupon_code': coupon_code,
            'discount': 10,
            'recovery_link': f"{settings.FRONTEND_BASE_URL}/cart?recovery={abandoned_cart.id}"
        }
        
        html_message = render_to_string('abandoned_cart/email_24h.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [abandoned_cart.user.email],
            html_message=html_message,
            fail_silently=True
        )
        
        return True
    
    @staticmethod
    def send_third_email(abandoned_cart):
        """Envia terceiro email de recuperação (72 horas) - 15% desconto"""
        if abandoned_cart.third_email_sent:
            return False
        
        # Gerar cupom
        coupon_code = AbandonedCartService.generate_recovery_coupon(15)
        abandoned_cart.recovery_coupon_72h = coupon_code
        abandoned_cart.third_email_sent = timezone.now()
        abandoned_cart.save()
        
        # Enviar email
        subject = f"🎁 ÚLTIMA OPORTUNIDADE: 15% OFF especial para você!"
        
        context = {
            'user': abandoned_cart.user,
            'cart': abandoned_cart,
            'coupon_code': coupon_code,
            'discount': 15,
            'recovery_link': f"{settings.FRONTEND_BASE_URL}/cart?recovery={abandoned_cart.id}"
        }
        
        html_message = render_to_string('abandoned_cart/email_72h.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [abandoned_cart.user.email],
            html_message=html_message,
            fail_silently=True
        )
        
        return True
    
    @staticmethod
    def process_abandoned_carts():
        """Processa carrinhos abandonados (executar via Celery task)"""
        active_carts = AbandonedCart.objects.filter(status='active')
        
        emails_sent = {
            '1h': 0,
            '24h': 0,
            '72h': 0
        }
        
        for cart in active_carts:
            # Primeiro email (1 hora)
            if cart.should_send_first_email():
                if AbandonedCartService.send_first_email(cart):
                    emails_sent['1h'] += 1
            
            # Segundo email (24 horas)
            elif cart.should_send_second_email():
                if AbandonedCartService.send_second_email(cart):
                    emails_sent['24h'] += 1
            
            # Terceiro email (72 horas)
            elif cart.should_send_third_email():
                if AbandonedCartService.send_third_email(cart):
                    emails_sent['72h'] += 1
            
            # Expirar carrinhos muito antigos (7 dias)
            elif timezone.now() >= cart.created_at + timedelta(days=7):
                cart.status = 'expired'
                cart.save()
        
        return emails_sent
    
    @staticmethod
    def calculate_daily_metrics(date=None):
        """Calcula métricas diárias"""
        if not date:
            date = timezone.now().date()
        
        start_of_day = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.min.time()))
        end_of_day = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.max.time()))
        
        # Carrinhos abandonados no dia
        abandoned = AbandonedCart.objects.filter(
            created_at__range=[start_of_day, end_of_day]
        )
        
        total_abandoned = abandoned.count()
        total_value_abandoned = sum(cart.total_value for cart in abandoned)
        
        # Emails enviados
        emails_1h = abandoned.filter(first_email_sent__isnull=False).count()
        emails_24h = abandoned.filter(second_email_sent__isnull=False).count()
        emails_72h = abandoned.filter(third_email_sent__isnull=False).count()
        
        # Recuperados
        recovered = abandoned.filter(status='recovered')
        total_recovered = recovered.count()
        total_value_recovered = sum(cart.total_value for cart in recovered)
        
        # Taxa de recuperação
        recovery_rate = (total_recovered / total_abandoned * 100) if total_abandoned > 0 else 0
        
        # Criar ou atualizar métrica
        metrics, created = AbandonedCartMetrics.objects.update_or_create(
            date=date,
            defaults={
                'total_abandoned': total_abandoned,
                'total_value_abandoned': total_value_abandoned,
                'emails_sent_1h': emails_1h,
                'emails_sent_24h': emails_24h,
                'emails_sent_72h': emails_72h,
                'total_recovered': total_recovered,
                'total_value_recovered': total_value_recovered,
                'recovery_rate': recovery_rate
            }
        )
        
        return metrics
