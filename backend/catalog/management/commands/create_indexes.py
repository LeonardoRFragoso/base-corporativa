from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Cria índices customizados para melhorar performance do e-commerce'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            self.stdout.write('Criando índices de performance...')
            
            # Índice composto para busca de produtos ativos por categoria
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_product_active_category_created 
                    ON catalog_product(is_active, category_id, created_at DESC)
                    WHERE is_active = true;
                """)
                self.stdout.write(self.style.SUCCESS('✓ Índice de produtos ativos criado'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Índice já existe ou erro: {e}'))
            
            # Índice para busca de variantes com estoque
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_variant_stock_available 
                    ON catalog_productvariant(product_id, stock)
                    WHERE stock > 0;
                """)
                self.stdout.write(self.style.SUCCESS('✓ Índice de variantes com estoque criado'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Índice já existe ou erro: {e}'))
            
            # Índice para pedidos por status e data
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_order_status_created 
                    ON orders_order(status, created_at DESC);
                """)
                self.stdout.write(self.style.SUCCESS('✓ Índice de pedidos por status criado'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Índice já existe ou erro: {e}'))
            
            # Índice para reviews aprovadas
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_review_approved_product 
                    ON reviews_review(product_id, approved, created_at DESC)
                    WHERE approved = true;
                """)
                self.stdout.write(self.style.SUCCESS('✓ Índice de reviews aprovadas criado'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Índice já existe ou erro: {e}'))
            
            self.stdout.write(self.style.SUCCESS('\n✅ Índices de performance criados com sucesso!'))
