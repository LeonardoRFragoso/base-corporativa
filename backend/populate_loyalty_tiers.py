#!/usr/bin/env python
"""
Script para popular os níveis de fidelidade
Execute: python populate_loyalty_tiers.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from loyalty.models import LoyaltyTier

def populate_tiers():
    """Cria os 4 níveis de fidelidade"""
    
    # Verificar se já existem níveis
    if LoyaltyTier.objects.exists():
        print("⚠️  Níveis de fidelidade já existem!")
        print(f"Total: {LoyaltyTier.objects.count()} níveis")
        for tier in LoyaltyTier.objects.all():
            print(f"  - {tier.name}: {tier.cashback_percentage}% cashback (min {tier.min_points} pontos)")
        
        resposta = input("\nDeseja recriar os níveis? (s/N): ")
        if resposta.lower() != 's':
            print("❌ Operação cancelada.")
            return
        
        print("🗑️  Removendo níveis existentes...")
        LoyaltyTier.objects.all().delete()
    
    print("🎯 Criando níveis de fidelidade...\n")
    
    # Bronze
    bronze = LoyaltyTier.objects.create(
        name='Bronze',
        min_points=0,
        cashback_percentage=3.00,
        color='#CD7F32',
        icon='🥉',
        benefits='3% de cashback em todas as compras'
    )
    print(f"✅ {bronze.icon} {bronze.name} criado - {bronze.cashback_percentage}% cashback")
    
    # Prata
    prata = LoyaltyTier.objects.create(
        name='Prata',
        min_points=1000,
        cashback_percentage=5.00,
        color='#C0C0C0',
        icon='🥈',
        benefits='5% de cashback + Frete grátis acima de R$ 100'
    )
    print(f"✅ {prata.icon} {prata.name} criado - {prata.cashback_percentage}% cashback (a partir de {prata.min_points} pontos)")
    
    # Ouro
    ouro = LoyaltyTier.objects.create(
        name='Ouro',
        min_points=5000,
        cashback_percentage=7.00,
        color='#FFD700',
        icon='🥇',
        benefits='7% de cashback + Frete grátis + Acesso antecipado a promoções'
    )
    print(f"✅ {ouro.icon} {ouro.name} criado - {ouro.cashback_percentage}% cashback (a partir de {ouro.min_points} pontos)")
    
    # Platinum
    platinum = LoyaltyTier.objects.create(
        name='Platinum',
        min_points=10000,
        cashback_percentage=10.00,
        color='#E5E4E2',
        icon='💎',
        benefits='10% de cashback + Todos os benefícios + Atendimento VIP'
    )
    print(f"✅ {platinum.icon} {platinum.name} criado - {platinum.cashback_percentage}% cashback (a partir de {platinum.min_points} pontos)")
    
    print("\n" + "="*60)
    print("🎉 PROGRAMA DE FIDELIDADE CONFIGURADO COM SUCESSO!")
    print("="*60)
    print("\n📊 Resumo dos Níveis:")
    print(f"  🥉 Bronze (0+ pts): 3% cashback")
    print(f"  🥈 Prata (1.000+ pts): 5% cashback")
    print(f"  🥇 Ouro (5.000+ pts): 7% cashback")
    print(f"  💎 Platinum (10.000+ pts): 10% cashback")
    print("\n💡 Os clientes ganham 1 ponto para cada R$ 1 gasto!")
    print("💡 Acesse o Django Admin para gerenciar: /admin/loyalty/")

if __name__ == '__main__':
    try:
        populate_tiers()
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
