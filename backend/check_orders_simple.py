import sqlite3
import os

# Conectar ao banco SQLite
db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Verificar pedidos
cursor.execute("""
    SELECT id, status, mp_status, total_amount, external_reference, 
           mp_payment_id, email, created_at
    FROM orders_order 
    ORDER BY created_at DESC 
    LIMIT 10
""")

orders = cursor.fetchall()
print(f'Total de pedidos encontrados: {len(orders)}')

for order in orders:
    print(f'Pedido {order[0]}:')
    print(f'  Status: {order[1]}')
    print(f'  MP Status: {order[2]}')
    print(f'  Total: R$ {order[3]}')
    print(f'  External Reference: {order[4]}')
    print(f'  MP Payment ID: {order[5]}')
    print(f'  Email: {order[6]}')
    print(f'  Criado em: {order[7]}')
    print('---')

# Verificar pedidos pagos
cursor.execute("""
    SELECT COUNT(*), SUM(total_amount)
    FROM orders_order 
    WHERE status = 'paid'
""")

paid_stats = cursor.fetchone()
print(f'\nPedidos pagos: {paid_stats[0]}')
print(f'Total em vendas pagas: R$ {paid_stats[1] or 0:.2f}')

conn.close()
