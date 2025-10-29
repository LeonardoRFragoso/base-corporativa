import requests
import json

# URL da API de produção
BASE_URL = "https://base-corporativa-production.up.railway.app"

# Credenciais de admin (você pode usar as suas)
admin_credentials = {
    "username": "leonardo.fragoso",
    "password": "Marleyj@23"
}

def get_admin_token():
    """Obter token de admin"""
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login/", json=admin_credentials)
        if response.status_code == 200:
            return response.json().get('access')
        else:
            print(f"Erro ao fazer login: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Erro na requisição de login: {e}")
        return None

def check_dashboard_data(token):
    """Verificar dados do dashboard"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Verificar overview do dashboard
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print("=== DADOS DO DASHBOARD DE PRODUÇÃO ===")
            print(f"Vendas totais: R$ {data['sales']['total']:.2f}")
            print(f"Vendas últimos 30 dias: R$ {data['sales']['last_30_days']:.2f}")
            print(f"Vendas últimos 7 dias: R$ {data['sales']['last_7_days']:.2f}")
            print(f"Ticket médio: R$ {data['sales']['avg_order_value']:.2f}")
            print(f"Total de pedidos: {data['orders']['total']}")
            print(f"Pedidos pendentes: {data['orders']['pending']}")
            print(f"Pedidos pagos: {data['orders']['paid']}")
            print()
            
            # Verificar pedidos recentes
            response = requests.get(f"{BASE_URL}/api/analytics/recent-orders/", headers=headers)
            if response.status_code == 200:
                orders = response.json()
                print("=== PEDIDOS RECENTES ===")
                for order in orders[:5]:
                    print(f"Pedido {order['id']}: {order['status']} - R$ {order['total']:.2f} - {order['customer']} - {order['created_at']}")
            
            # Verificar distribuição por status
            response = requests.get(f"{BASE_URL}/api/analytics/order-status/", headers=headers)
            if response.status_code == 200:
                status_data = response.json()
                print("\n=== DISTRIBUIÇÃO POR STATUS ===")
                for item in status_data:
                    print(f"{item['status']}: {item['count']} pedidos - R$ {item['total']:.2f}")
                    
        else:
            print(f"Erro ao acessar dashboard: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Erro ao verificar dados: {e}")

if __name__ == "__main__":
    print("Conectando à API de produção...")
    token = get_admin_token()
    if token:
        print("Login realizado com sucesso!")
        check_dashboard_data(token)
    else:
        print("Falha no login")
