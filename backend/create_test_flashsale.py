#!/usr/bin/env python
"""
Script para criar uma Flash Sale de teste
Execute: python manage.py shell < create_test_flashsale.py
"""
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from promotions.models import FlashSale
from django.utils import timezone

# Criar Flash Sale de teste
flash_sale = FlashSale.objects.create(
    name="TESTE FLASH SALE",
    description="Use o cupom TESTE30 para ganhar 30% de desconto!",
    discount_percentage=30.00,
    start_time=timezone.now(),
    end_time=timezone.now() + timedelta(hours=2),  # Expira em 2 horas
    is_active=True,
    max_quantity=None,  # Ilimitado
    current_sold=0
)

print(f"✅ Flash Sale criada com sucesso!")
print(f"   ID: {flash_sale.id}")
print(f"   Nome: {flash_sale.name}")
print(f"   Desconto: {flash_sale.discount_percentage}%")
print(f"   Início: {flash_sale.start_time}")
print(f"   Fim: {flash_sale.end_time}")
print(f"   Status: {'🔥 AO VIVO' if flash_sale.is_live() else '⏰ AGENDADO'}")
print(f"\n🌐 Acesse: http://localhost:5173 para ver o banner!")
