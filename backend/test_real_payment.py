import requests
import json

BASE_URL = "https://base-corporativa-production.up.railway.app"
MP_ACCESS_TOKEN = "APP_USR-2467246722825087-102114-5dedccfa9fd33de5ea421076daaeaf95-175427787"

def get_admin_token():
    """Obter token de admin"""
    admin_credentials = {
        "username": "leonardo.fragoso",
        "password": "Marleyj@23"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login/", json=admin_credentials)
        if response.status_code == 200:
            return response.json().get('access')
    except Exception as e:
        print(f"Erro no login: {e}")
    return None

def search_recent_payments():
    """Buscar pagamentos recentes no Mercado Pago"""
    print("=== BUSCANDO PAGAMENTOS RECENTES NO MP ===")
    
    headers = {"Authorization": f"Bearer {MP_ACCESS_TOKEN}"}
    
    try:
        # Buscar pagamentos recentes
        response = requests.get("https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&range=date_created&begin_date=2025-10-28T00:00:00.000-03:00&end_date=2025-10-29T23:59:59.000-03:00", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            payments = data.get('results', [])
            print(f"Pagamentos encontrados: {len(payments)}")
            
            for payment in payments[:5]:  # Mostrar os 5 mais recentes
                print(f"\n💳 Pagamento {payment.get('id')}:")
                print(f"   Status: {payment.get('status')}")
                print(f"   Valor: {payment.get('transaction_amount')}")
                print(f"   External Reference: {payment.get('external_reference')}")
                print(f"   Data: {payment.get('date_created')}")
                print(f"   Método: {payment.get('payment_method_id')}")
                
                # Se o pagamento está aprovado, testar webhook
                if payment.get('status') == 'approved':
                    print(f"   ✅ PAGAMENTO APROVADO - Testando webhook...")
                    test_webhook_with_payment(payment.get('id'))
                    
        else:
            print(f"❌ Erro na busca: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Erro: {e}")

def test_webhook_with_payment(payment_id):
    """Testar webhook com ID de pagamento real"""
    webhook_payload = {
        "topic": "payment",
        "data": {"id": str(payment_id)}
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/payments/webhook/", json=webhook_payload)
        print(f"   Webhook Status: {response.status_code}")
        print(f"   Webhook Response: {response.text}")
        
        # Verificar se o pedido foi atualizado
        check_order_update(payment_id)
        
    except Exception as e:
        print(f"   ❌ Erro no webhook: {e}")

def check_order_update(payment_id):
    """Verificar se algum pedido foi atualizado após o webhook"""
    token = get_admin_token()
    if not token:
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/recent-orders/?limit=5", headers=headers)
        if response.status_code == 200:
            orders = response.json()
            print(f"   📋 Verificando pedidos recentes...")
            
            for order in orders:
                if order.get('status') == 'paid':
                    print(f"   ✅ PEDIDO PAGO ENCONTRADO: {order['id']}")
                    return
                    
            print(f"   ❌ Nenhum pedido pago encontrado")
            
    except Exception as e:
        print(f"   ❌ Erro ao verificar pedidos: {e}")

def check_webhook_logs():
    """Tentar verificar logs do webhook"""
    print("\n=== VERIFICANDO LOGS DO WEBHOOK ===")
    
    # Como não temos acesso direto aos logs do Railway,
    # vamos fazer um teste mais detalhado do webhook
    
    # Testar com dados inválidos para ver como o webhook responde
    invalid_payloads = [
        {"topic": "payment", "data": {"id": "invalid_id"}},
        {"topic": "payment", "data": {"id": ""}},
        {"topic": "payment"},
        {"data": {"id": "123"}},
        {}
    ]
    
    for i, payload in enumerate(invalid_payloads, 1):
        print(f"\n--- Teste {i}: {json.dumps(payload)} ---")
        try:
            response = requests.post(f"{BASE_URL}/api/payments/webhook/", json=payload)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Erro: {e}")

if __name__ == "__main__":
    search_recent_payments()
    check_webhook_logs()
