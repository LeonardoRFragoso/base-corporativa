"""
Script para migrar wishlist antiga (users.WishlistItem) para o novo sistema avançado (wishlist.WishlistItem)
Execute: python manage.py shell < migrate_old_wishlist.py
"""

from users.models import WishlistItem as OldWishlistItem
from wishlist.models import WishlistCollection, WishlistItem as NewWishlistItem
from django.contrib.auth import get_user_model

User = get_user_model()

def migrate_wishlist():
    """Migra wishlist antiga para o novo sistema"""
    
    print("🔄 Iniciando migração de wishlist...")
    
    # Buscar todos os itens da wishlist antiga
    old_items = OldWishlistItem.objects.all()
    total = old_items.count()
    
    if total == 0:
        print("✅ Nenhum item para migrar.")
        return
    
    print(f"📊 Encontrados {total} itens para migrar")
    
    migrated = 0
    errors = 0
    
    # Agrupar por usuário
    users_with_items = old_items.values_list('user_id', flat=True).distinct()
    
    for user_id in users_with_items:
        try:
            user = User.objects.get(id=user_id)
            
            # Criar ou buscar coleção padrão
            collection, created = WishlistCollection.objects.get_or_create(
                user=user,
                is_default=True,
                defaults={
                    'name': 'Minha Lista de Desejos',
                    'description': 'Migrado da wishlist antiga'
                }
            )
            
            if created:
                print(f"  ✨ Criada coleção padrão para {user.email}")
            
            # Migrar itens do usuário
            user_items = old_items.filter(user=user)
            
            for old_item in user_items:
                # Verificar se já existe
                if NewWishlistItem.objects.filter(
                    collection=collection,
                    product=old_item.product
                ).exists():
                    print(f"  ⚠️  Item já existe: {old_item.product.name}")
                    continue
                
                # Criar novo item
                NewWishlistItem.objects.create(
                    collection=collection,
                    product=old_item.product,
                    price_when_added=old_item.product.price,
                    stock_when_added=old_item.product.stock,
                    priority='medium',
                    notify_on_sale=True,
                    notify_on_stock=True,
                    notify_on_price_drop=True
                )
                
                migrated += 1
                print(f"  ✅ Migrado: {old_item.product.name}")
        
        except Exception as e:
            errors += 1
            print(f"  ❌ Erro ao migrar usuário {user_id}: {str(e)}")
    
    print(f"\n📈 Migração concluída!")
    print(f"  ✅ Migrados: {migrated}")
    print(f"  ❌ Erros: {errors}")
    print(f"  📊 Total: {total}")
    
    # Opcional: Deletar itens antigos após confirmação
    if migrated > 0:
        print(f"\n⚠️  Para deletar os itens antigos, execute:")
        print(f"  from users.models import WishlistItem")
        print(f"  WishlistItem.objects.all().delete()")

if __name__ == '__main__':
    migrate_wishlist()
