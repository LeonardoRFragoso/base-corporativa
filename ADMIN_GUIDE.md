# Guia do Sistema Administrativo - BASE CORPORATIVA

## 📊 Visão Geral

O sistema administrativo da BASE CORPORATIVA oferece duas interfaces completas para gerenciar seu e-commerce:

1. **Django Admin** - Interface administrativa nativa do Django (backend)
2. **Dashboard Frontend** - Painel moderno e visual no frontend

---

## 🔐 Acesso Administrativo

### Criando um Usuário Administrador

Para acessar o sistema administrativo, você precisa de um usuário com privilégios de staff/admin.

**Via Terminal (Backend):**
```bash
cd backend
python manage.py createsuperuser
```

**Ou via Django Shell:**
```bash
python manage.py shell
```
```python
from users.models import User
admin = User.objects.create_user(
    username='admin',
    email='admin@basecorporativa.store',
    password='senha_segura',
    is_staff=True,
    is_superuser=True
)
```

---

## 🎯 Django Admin (Backend)

### Acesso
- **URL Local:** `http://localhost:8000/admin/`
- **URL Produção:** `https://seu-dominio.railway.app/admin/`

### Recursos Disponíveis

#### 📦 Gestão de Produtos
- **Visualização:** Lista com estoque colorido (verde/laranja/vermelho)
- **Filtros:** Por categoria, status ativo, tipo de tecido, data
- **Busca:** Por nome, slug, descrição
- **Ações em massa:** Ativar/desativar múltiplos produtos
- **Inlines:** Edite variantes e imagens diretamente na página do produto

**Campos importantes:**
- `base_price`: Preço base do produto
- `is_active`: Define se o produto aparece no catálogo
- `slug`: URL amigável (gerado automaticamente)

#### 🎨 Variantes de Produtos
- Gestão de tamanhos (XS, S, M, L, XL, XXL)
- Cores personalizadas
- SKU único para cada variante
- Controle de estoque individual
- Preço específico (opcional, usa base_price se vazio)

**Alertas de Estoque:**
- 🔴 Vermelho: Sem estoque (0 unidades)
- 🟠 Laranja: Estoque baixo (< 5 unidades)
- 🟢 Verde: Estoque OK (≥ 5 unidades)

#### 🛒 Gestão de Pedidos
- **Status disponíveis:**
  - `pending`: Aguardando pagamento
  - `paid`: Pago e confirmado
  - `failed`: Pagamento falhou
  - `canceled`: Cancelado

- **Informações exibidas:**
  - Dados do cliente
  - Itens do pedido com subtotais
  - Valores de frete e desconto
  - Informações de pagamento (Mercado Pago)
  - Endereço de entrega

#### 👥 Gestão de Usuários
- Visualizar clientes cadastrados
- Verificar pedidos por cliente
- Gerenciar permissões de staff/admin

---

## 💻 Dashboard Frontend

### Acesso
- **URL Local:** `http://localhost:5173/admin/dashboard`
- **URL Produção:** `https://seu-dominio.com/admin/dashboard`

**Requisitos:**
- Usuário logado com `is_staff=True`
- Token JWT válido

### Páginas Disponíveis

#### 1. Dashboard Principal (`/admin/dashboard`)

**Métricas Principais:**
- 💰 **Vendas Totais:** Receita total e dos últimos 30 dias
- 🛒 **Pedidos:** Total e pedidos pendentes
- 📦 **Produtos:** Total de produtos e estoque
- 👥 **Clientes:** Total e novos clientes do mês

**Gráficos:**
- 📈 Vendas diárias (7, 30 ou 90 dias)
- 🏆 Top 5 produtos mais vendidos
- ⚠️ Alertas de estoque baixo/zerado
- 📅 Pedidos recentes

**Ações Rápidas:**
- Gerenciar Pedidos
- Gerenciar Produtos
- Acessar Django Admin

#### 2. Gestão de Pedidos (`/admin/orders`)

**Recursos:**
- 🔍 Busca por ID, email ou nome do cliente
- 🎯 Filtro por status (todos, pendente, pago, falhou, cancelado)
- 👁️ Visualização detalhada de cada pedido
- 📊 Tabela com todas as informações

**Modal de Detalhes:**
- Informações completas do cliente
- Lista de itens com preços
- Resumo de valores (subtotal, frete, desconto, total)
- Dados de pagamento (Mercado Pago)
- Informações de entrega

#### 3. Gestão de Produtos (`/admin/products`)

**Estatísticas:**
- Total de produtos
- Produtos em estoque (≥10 unidades)
- Produtos com estoque baixo (1-9 unidades)
- Produtos sem estoque

**Recursos:**
- 🔍 Busca por nome ou slug
- 🎯 Filtro por status de estoque
- 📦 Cards visuais com imagens
- 👁️ Visualização detalhada com todas as variantes
- ➕ Botão para criar novo produto (redireciona para Django Admin)
- ✏️ Editar produto no Django Admin

**Modal de Detalhes:**
- Informações básicas do produto
- Estoque total e número de variantes
- Tabela completa de variantes (SKU, tamanho, cor, preço, estoque)
- Galeria de imagens

---

## 📊 API Analytics

### Endpoints Disponíveis

Todos os endpoints requerem autenticação de administrador (`IsAdminUser`).

#### 1. Dashboard Overview
```
GET /api/analytics/dashboard/
```
Retorna métricas gerais: vendas, pedidos, produtos, clientes.

#### 2. Gráfico de Vendas
```
GET /api/analytics/sales-chart/?period=30
```
Parâmetros:
- `period`: 7, 30 ou 90 dias

#### 3. Top Produtos
```
GET /api/analytics/top-products/?limit=10
```
Produtos mais vendidos por quantidade e receita.

#### 4. Alertas de Estoque
```
GET /api/analytics/low-stock/?threshold=5
```
Variantes com estoque abaixo do threshold.

#### 5. Pedidos Recentes
```
GET /api/analytics/recent-orders/?limit=10
```
Últimos pedidos criados.

#### 6. Distribuição por Status
```
GET /api/analytics/order-status/
```
Contagem e total de pedidos por status.

#### 7. Receita Mensal
```
GET /api/analytics/monthly-revenue/
```
Receita dos últimos 12 meses.

---

## 🎨 Melhorias no Django Admin

### Django Admin Interface

O projeto utiliza `django-admin-interface` para uma interface mais moderna e personalizável.

**Instalação:**
```bash
pip install django-admin-interface django-colorfield
```

**Recursos:**
- Tema escuro/claro
- Cores personalizáveis
- Logo customizado
- Interface responsiva

### Customizações Implementadas

#### Produtos:
- Preview de imagens inline
- Status de estoque colorido
- Ações em massa (ativar/desativar)
- Fieldsets organizados
- Filtros avançados

#### Pedidos:
- Badges coloridos por status
- Links para cliente e itens
- Valores formatados em R$
- Date hierarchy para navegação temporal
- Inline de itens com subtotais

#### Variantes:
- Badge de estoque colorido
- Edição inline de estoque
- Links para produto pai
- Filtros por tamanho e categoria

---

## 🚀 Deploy e Configuração

### Variáveis de Ambiente Necessárias

```env
# Django Admin
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@basecorporativa.store
DJANGO_SUPERUSER_PASSWORD=senha_segura

# Segurança
SECRET_KEY=sua-secret-key-segura
DEBUG=False
ALLOWED_HOSTS=seu-dominio.railway.app,seu-dominio.com
```

### Migrações

Após adicionar o app analytics:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Coletar Arquivos Estáticos

```bash
python manage.py collectstatic --noinput
```

---

## 📱 Acesso Mobile

O Dashboard Frontend é totalmente responsivo e funciona em:
- 📱 Smartphones
- 📲 Tablets
- 💻 Desktops

---

## 🔒 Segurança

### Permissões

- **Django Admin:** Requer `is_staff=True`
- **API Analytics:** Requer `is_staff=True` e token JWT válido
- **Dashboard Frontend:** Verifica token e redireciona se não autorizado

### Boas Práticas

1. Use senhas fortes para usuários admin
2. Ative HTTPS em produção
3. Mantenha `DEBUG=False` em produção
4. Configure `ALLOWED_HOSTS` corretamente
5. Use variáveis de ambiente para credenciais

---

## 🆘 Solução de Problemas

### Erro 403 ao acessar Analytics
**Causa:** Usuário não tem permissão de staff.
**Solução:**
```python
user = User.objects.get(email='usuario@email.com')
user.is_staff = True
user.save()
```

### Dashboard não carrega dados
**Causa:** Token expirado ou inválido.
**Solução:** Faça logout e login novamente.

### Produtos não aparecem no estoque
**Causa:** Variantes sem estoque ou produto inativo.
**Solução:** Verifique `is_active=True` e adicione estoque nas variantes.

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do Django: `python manage.py runserver`
2. Verifique o console do navegador (F12)
3. Consulte a documentação do Django Admin

---

## 🎯 Próximos Passos

Funcionalidades futuras sugeridas:
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Notificações de estoque baixo por email
- [ ] Gráficos mais avançados (Chart.js ou Recharts)
- [ ] Gestão de cupons de desconto
- [ ] Análise de comportamento de clientes
- [ ] Dashboard de métricas de marketing

---

**Desenvolvido para BASE CORPORATIVA** 🏢
