import requests
import json
from datetime import datetime

BASE_URL = "https://base-corporativa-production.up.railway.app"

def test_frontend_api_calls():
    """Simular exatamente as chamadas que o frontend faz"""
    
    # 1. Login como admin
    print("=== 1. FAZENDO LOGIN ===")
    login_data = {
        "username": "leonardo.fragoso",
        "password": "Marleyj@23"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
        if response.status_code == 200:
            token = response.json().get('access')
            print(f"✅ Login realizado com sucesso")
            print(f"Token: {token[:20]}...")
        else:
            print(f"❌ Erro no login: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Erro na requisição de login: {e}")
        return
    
    # 2. Headers que o frontend usa
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-Session-Key": "test-session-key"  # Simular session key
    }
    
    # 3. Fazer as mesmas requisições que o Dashboard.jsx faz
    print(f"\n=== 2. FAZENDO REQUISIÇÕES DO DASHBOARD ===")
    
    endpoints = [
        ("/api/analytics/dashboard/", "Dashboard Overview"),
        ("/api/analytics/sales-chart/?period=30", "Sales Chart"),
        ("/api/analytics/top-products/?limit=5", "Top Products"),
        ("/api/analytics/low-stock/?threshold=5", "Low Stock"),
        ("/api/analytics/recent-orders/?limit=5", "Recent Orders")
    ]
    
    results = {}
    
    for endpoint, name in endpoints:
        print(f"\n🔍 {name}: {endpoint}")
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                results[endpoint] = data
                
                # Mostrar dados específicos
                if endpoint == "/api/analytics/dashboard/":
                    sales = data.get('sales', {})
                    orders = data.get('orders', {})
                    print(f"   💰 Vendas totais: R$ {sales.get('total', 0):.2f}")
                    print(f"   📦 Pedidos pagos: {orders.get('paid', 0)}")
                    print(f"   📊 Total pedidos: {orders.get('total', 0)}")
                    
                elif endpoint == "/api/analytics/recent-orders/?limit=5":
                    paid_orders = [o for o in data if o.get('status') == 'paid']
                    print(f"   📋 Pedidos pagos: {len(paid_orders)}")
                    for order in paid_orders:
                        print(f"      Pedido {order['id']}: R$ {order['total']:.2f}")
                        
                elif endpoint == "/api/analytics/sales-chart/?period=30":
                    if isinstance(data, dict) and 'sales' in data:
                        total_sales = sum(data.get('sales', []))
                        print(f"   📈 Total vendas no gráfico: R$ {total_sales:.2f}")
                        print(f"   📅 Dias com dados: {len(data.get('sales', []))}")
                    
            else:
                print(f"   ❌ Erro: {response.text[:100]}")
                
        except Exception as e:
            print(f"   ❌ Exceção: {e}")
    
    # 4. Verificar se há diferenças nos dados
    print(f"\n=== 3. ANÁLISE DOS DADOS ===")
    
    dashboard_data = results.get("/api/analytics/dashboard/")
    if dashboard_data:
        sales_total = dashboard_data.get('sales', {}).get('total', 0)
        paid_orders = dashboard_data.get('orders', {}).get('paid', 0)
        
        print(f"📊 Resumo dos dados retornados:")
        print(f"   Vendas totais: R$ {sales_total:.2f}")
        print(f"   Pedidos pagos: {paid_orders}")
        
        if sales_total == 0 and paid_orders == 0:
            print("   ❌ PROBLEMA: Dashboard retornando zeros!")
        elif sales_total > 0 and paid_orders > 0:
            print("   ✅ DADOS CORRETOS: Dashboard tem vendas!")
        else:
            print("   ⚠️  INCONSISTÊNCIA: Vendas e pedidos não batem")
    
    # 5. Testar cache headers
    print(f"\n=== 4. VERIFICANDO CACHE ===")
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard/", headers=headers)
        cache_headers = {}
        for key, value in response.headers.items():
            if key.lower() in ['cache-control', 'etag', 'last-modified', 'expires', 'vary']:
                cache_headers[key] = value
        
        if cache_headers:
            print("Headers de cache encontrados:")
            for key, value in cache_headers.items():
                print(f"   {key}: {value}")
        else:
            print("   ℹ️  Nenhum header de cache específico encontrado")
            
    except Exception as e:
        print(f"   ❌ Erro ao verificar cache: {e}")

def test_cors_and_preflight():
    """Testar CORS e requisições preflight"""
    print(f"\n=== 5. TESTANDO CORS ===")
    
    # Simular requisição OPTIONS (preflight)
    try:
        response = requests.options(f"{BASE_URL}/api/analytics/dashboard/", 
                                  headers={
                                      "Origin": "https://basecorporativa.store",
                                      "Access-Control-Request-Method": "GET",
                                      "Access-Control-Request-Headers": "authorization,content-type"
                                  })
        print(f"OPTIONS Status: {response.status_code}")
        
        cors_headers = {}
        for key, value in response.headers.items():
            if key.lower().startswith('access-control'):
                cors_headers[key] = value
                
        if cors_headers:
            print("Headers CORS:")
            for key, value in cors_headers.items():
                print(f"   {key}: {value}")
        
    except Exception as e:
        print(f"❌ Erro no teste CORS: {e}")

if __name__ == "__main__":
    test_frontend_api_calls()
    test_cors_and_preflight()
