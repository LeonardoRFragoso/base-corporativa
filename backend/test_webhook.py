import requests
import json

# URL do webhook de produção
WEBHOOK_URL = "https://base-corporativa-production.up.railway.app/api/payments/webhook/"

def test_webhook_accessibility():
    """Testar se o webhook está acessível"""
    print("=== TESTANDO ACESSIBILIDADE DO WEBHOOK ===")
    
    try:
        # Teste GET
        response = requests.get(WEBHOOK_URL, timeout=10)
        print(f"GET {WEBHOOK_URL}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        print()
        
        # Teste POST com dados simulados
        test_payload = {
            "topic": "payment",
            "data": {"id": "123456789"}
        }
        
        response = requests.post(WEBHOOK_URL, json=test_payload, timeout=10)
        print(f"POST {WEBHOOK_URL}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT - Webhook não responde em 10 segundos")
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR - Não foi possível conectar ao webhook")
    except Exception as e:
        print(f"❌ ERRO: {e}")

def test_mercadopago_webhook_format():
    """Testar com formato real do Mercado Pago"""
    print("\n=== TESTANDO COM FORMATO MERCADO PAGO ===")
    
    # Formato típico de notificação do MP
    mp_payload = {
        "id": 12345,
        "live_mode": True,
        "type": "payment",
        "date_created": "2025-10-29T14:00:00.000-04:00",
        "application_id": 2467246722825087,
        "user_id": 175427787,
        "version": 1,
        "api_version": "v1",
        "action": "payment.updated",
        "data": {
            "id": "1234567890"
        }
    }
    
    try:
        response = requests.post(WEBHOOK_URL, json=mp_payload, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"❌ ERRO: {e}")

if __name__ == "__main__":
    test_webhook_accessibility()
    test_mercadopago_webhook_format()
