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

def create_test_order():
    """Criar um pedido de teste para verificar o webhook"""
    token = get_admin_token()
    if not token:
        return None
        
    headers = {"Authorization": f"Bearer {token}"}
    
    # Dados de teste para criar uma preferência
    test_cart = {
        "items": [
            {
                "name": "Produto Teste Webhook",
                "price": 10.00,
                "qty": 1,
                "size": "M",
                "color": "Azul"
            }
        ],
        "email": "teste@webhook.com",
        "first_name": "Teste",
        "last_name": "Webhook"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/payments/create-preference/", 
                               json=test_cart, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erro ao criar preferência: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Erro na criação: {e}")
    
    return None

def test_webhook_with_real_order():
    """Testar webhook com pedido real"""
    print("=== CRIANDO PEDIDO DE TESTE ===")
    
    preference_data = create_test_order()
    if not preference_data:
        print("❌ Falha ao criar pedido de teste")
        return
        
    print(f"✅ Pedido criado: {preference_data.get('order_id')}")
    print(f"External Reference: {preference_data.get('external_reference')}")
    
    # Simular webhook para este pedido
    order_ref = preference_data.get('external_reference')
    
    # Criar um pagamento fictício no formato MP
    fake_payment_data = {
        "id": 999999999,
        "status": "approved",
        "external_reference": order_ref,
        "transaction_amount": 10.00
    }
    
    print(f"\n=== SIMULANDO WEBHOOK PARA PEDIDO REAL ===")
    
    # Testar diferentes formatos de webhook
    webhook_formats = [
        # Formato 1: topic + data.id
        {
            "topic": "payment",
            "data": {"id": "999999999"}
        },
        # Formato 2: type + id direto
        {
            "type": "payment", 
            "id": "999999999"
        },
        # Formato 3: resource URL (formato antigo)
        {
            "resource": "https://api.mercadopago.com/v1/payments/999999999"
        }
    ]
    
    for i, payload in enumerate(webhook_formats, 1):
        print(f"\n--- Teste {i}: {json.dumps(payload)} ---")
        try:
            response = requests.post(f"{BASE_URL}/api/payments/webhook/", json=payload)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Erro: {e}")

def check_mp_webhook_config():
    """Verificar configuração do webhook no MP"""
    print("\n=== VERIFICANDO CONFIGURAÇÃO DO WEBHOOK NO MP ===")
    
    headers = {"Authorization": f"Bearer {MP_ACCESS_TOKEN}"}
    
    try:
        # Listar aplicações
        response = requests.get("https://api.mercadopago.com/applications", headers=headers)
        if response.status_code == 200:
            apps = response.json()
            print(f"Aplicações encontradas: {len(apps)}")
            for app in apps:
                print(f"  App ID: {app.get('id')} - Nome: {app.get('name')}")
                
                # Verificar webhooks da aplicação
                app_id = app.get('id')
                webhook_response = requests.get(f"https://api.mercadopago.com/applications/{app_id}", headers=headers)
                if webhook_response.status_code == 200:
                    app_details = webhook_response.json()
                    webhook_url = app_details.get('notification_url')
                    print(f"  Webhook URL: {webhook_url}")
        else:
            print(f"❌ Erro ao listar apps: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Erro na verificação: {e}")

if __name__ == "__main__":
    test_webhook_with_real_order()
    check_mp_webhook_config()
