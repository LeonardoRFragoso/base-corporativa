import requests
import json

# Configurações do Mercado Pago
MP_ACCESS_TOKEN = "APP_USR-2467246722825087-102114-5dedccfa9fd33de5ea421076daaeaf95-175427787"
BASE_URL = "https://base-corporativa-production.up.railway.app"

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

def get_recent_order_details(token):
    """Obter detalhes do pedido mais recente"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/recent-orders/?limit=1", headers=headers)
        if response.status_code == 200:
            orders = response.json()
            if orders:
                return orders[0]
    except Exception as e:
        print(f"Erro ao obter pedidos: {e}")
    return None

def check_mp_payment_status(payment_id):
    """Verificar status do pagamento no Mercado Pago"""
    if not payment_id:
        print("❌ Sem payment_id para verificar")
        return None
        
    headers = {"Authorization": f"Bearer {MP_ACCESS_TOKEN}"}
    
    try:
        response = requests.get(f"https://api.mercadopago.com/v1/payments/{payment_id}", headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Erro ao consultar MP: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Erro na consulta MP: {e}")
    return None

def simulate_webhook_call(payment_data):
    """Simular chamada do webhook com dados reais"""
    if not payment_data:
        return
        
    webhook_payload = {
        "topic": "payment",
        "data": {"id": str(payment_data.get('id'))}
    }
    
    print(f"\n=== SIMULANDO WEBHOOK ===")
    print(f"Payload: {json.dumps(webhook_payload, indent=2)}")
    
    try:
        response = requests.post(f"{BASE_URL}/api/payments/webhook/", json=webhook_payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Erro na simulação: {e}")

def main():
    print("=== DEBUG DO WEBHOOK MERCADO PAGO ===\n")
    
    # 1. Fazer login
    token = get_admin_token()
    if not token:
        print("❌ Falha no login")
        return
    
    # 2. Obter pedido mais recente
    order = get_recent_order_details(token)
    if not order:
        print("❌ Nenhum pedido encontrado")
        return
        
    print(f"📋 Pedido mais recente:")
    print(f"   ID: {order['id']}")
    print(f"   Status: {order['status']}")
    print(f"   Total: R$ {order['total']}")
    print(f"   Cliente: {order['customer']}")
    
    # 3. Se temos um payment_id, verificar no MP
    # Como não temos o payment_id no retorno da API, vamos tentar encontrar
    # um pagamento recente no MP que corresponda ao valor
    
    # 4. Simular webhook com ID fictício para testar o fluxo
    print(f"\n=== TESTANDO FLUXO DO WEBHOOK ===")
    test_payment_data = {"id": "1234567890"}  # ID fictício para teste
    simulate_webhook_call(test_payment_data)

if __name__ == "__main__":
    main()
