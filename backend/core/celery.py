import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Configuração de tarefas agendadas
app.conf.beat_schedule = {
    'send-abandoned-cart-emails': {
        'task': 'abandoned_cart.tasks.send_abandoned_cart_emails',
        'schedule': crontab(minute=0),  # A cada hora
    },
    'send-post-purchase-emails': {
        'task': 'abandoned_cart.tasks.send_post_purchase_emails',
        'schedule': crontab(hour=10, minute=0),  # Diariamente às 10h
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
