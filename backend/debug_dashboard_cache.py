import requests
import json
import time

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

def test_dashboard_endpoints():
    """Testar todos os endpoints do dashboard"""
    token = get_admin_token()
    if not token:
        print("❌ Falha no login")
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    
    endpoints = [
        "/api/analytics/dashboard/",
        "/api/analytics/recent-orders/",
        "/api/analytics/order-status/",
        "/api/analytics/sales-chart/",
        "/api/analytics/top-products/",
        "/api/analytics/monthly-revenue/"
    ]
    
    print("=== TESTANDO ENDPOINTS DO DASHBOARD ===\n")
    
    for endpoint in endpoints:
        print(f"🔍 Testando: {endpoint}")
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if endpoint == "/api/analytics/dashboard/":
                    sales = data.get('sales', {})
                    orders = data.get('orders', {})
                    print(f"   💰 Vendas totais: R$ {sales.get('total', 0):.2f}")
                    print(f"   📦 Pedidos pagos: {orders.get('paid', 0)}")
                elif endpoint == "/api/analytics/recent-orders/":
                    paid_orders = [o for o in data if o.get('status') == 'paid']
                    print(f"   📋 Pedidos pagos encontrados: {len(paid_orders)}")
                    for order in paid_orders:
                        print(f"      Pedido {order['id']}: R$ {order['total']:.2f}")
                elif endpoint == "/api/analytics/order-status/":
                    for status_info in data:
                        if status_info['status'] == 'paid':
                            print(f"   ✅ Status 'paid': {status_info['count']} pedidos - R$ {status_info['total']:.2f}")
                else:
                    print(f"   📊 Dados: {len(data) if isinstance(data, list) else 'objeto'}")
            else:
                print(f"   ❌ Erro: {response.text[:100]}")
                
        except Exception as e:
            print(f"   ❌ Exceção: {e}")
        
        print()

def test_cache_headers():
    """Verificar headers de cache"""
    token = get_admin_token()
    if not token:
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    
    print("=== VERIFICANDO HEADERS DE CACHE ===\n")
    
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard/", headers=headers)
        print(f"Status: {response.status_code}")
        print("Headers de resposta:")
        for key, value in response.headers.items():
            if key.lower() in ['cache-control', 'etag', 'last-modified', 'expires']:
                print(f"   {key}: {value}")
                
    except Exception as e:
        print(f"❌ Erro: {e}")

def test_multiple_requests():
    """Fazer múltiplas requisições para verificar consistência"""
    token = get_admin_token()
    if not token:
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    
    print("=== TESTANDO CONSISTÊNCIA (5 REQUISIÇÕES) ===\n")
    
    for i in range(5):
        try:
            response = requests.get(f"{BASE_URL}/api/analytics/dashboard/", headers=headers)
            if response.status_code == 200:
                data = response.json()
                sales_total = data.get('sales', {}).get('total', 0)
                paid_orders = data.get('orders', {}).get('paid', 0)
                print(f"Requisição {i+1}: R$ {sales_total:.2f} - {paid_orders} pedidos pagos")
            else:
                print(f"Requisição {i+1}: Erro {response.status_code}")
                
            time.sleep(1)  # Aguardar 1 segundo entre requisições
            
        except Exception as e:
            print(f"Requisição {i+1}: Exceção {e}")

if __name__ == "__main__":
    test_dashboard_endpoints()
    test_cache_headers()
    test_multiple_requests()
