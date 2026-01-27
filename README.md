# 🏢 Base Corporativa

<div align="center">

[![Django](https://img.shields.io/badge/Django-4.x-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Mercado Pago](https://img.shields.io/badge/Mercado_Pago-Integrado-00A650?style=for-the-badge)](https://www.mercadopago.com.br/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

**E-commerce completo de roupas corporativas com checkout integrado, PWA e sistema de gestão avançado.**

[🌐 Demo ao Vivo](https://basecorporativa.store/) • [Funcionalidades](#-funcionalidades) • [Instalação](#-instalação) • [API](#-api-endpoints)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-stack-tecnológico)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [API Endpoints](#-api-endpoints)
- [Deploy](#-deploy)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

**Base Corporativa** é uma plataforma e-commerce profissional desenvolvida para venda de roupas corporativas e uniformes empresariais. O sistema oferece uma experiência de compra completa, desde a navegação no catálogo até o checkout seguro com Mercado Pago.

### Diferenciais

- **PWA (Progressive Web App)** - Experiência mobile nativa com instalação
- **Checkout Seguro** - Integração completa com Mercado Pago (PIX, cartão, boleto)
- **SEO Otimizado** - Meta tags dinâmicas e sitemap automático
- **Analytics Integrado** - Google Analytics e Meta Pixel configurados
- **Gestão Completa** - Painel administrativo Django robusto

---

## ✨ Funcionalidades

### 🛒 E-commerce
| Funcionalidade | Descrição |
|----------------|-----------|
| **Catálogo de Produtos** | Listagem com filtros por categoria, tamanho e cor |
| **Carrinho de Compras** | Persistente com localStorage e sincronização com backend |
| **Wishlist** | Lista de desejos para produtos favoritos |
| **Busca Inteligente** | Busca por nome, descrição e categoria |
| **Variações de Produto** | Suporte a tamanhos, cores e combinações |

### 💳 Pagamentos
| Funcionalidade | Descrição |
|----------------|-----------|
| **Mercado Pago** | Checkout Pro integrado |
| **PIX** | Pagamento instantâneo com QR Code |
| **Cartão de Crédito** | Parcelamento em até 12x |
| **Boleto Bancário** | Opção para pagamento à vista |
| **Gift Cards** | Sistema de vales-presente |

### 👤 Usuários
| Funcionalidade | Descrição |
|----------------|-----------|
| **Cadastro/Login** | Autenticação JWT segura |
| **Múltiplos Endereços** | Gestão de endereços de entrega |
| **Histórico de Pedidos** | Acompanhamento completo |
| **Programa de Fidelidade** | Sistema de pontos e níveis |

### 📊 Gestão (Admin)
| Funcionalidade | Descrição |
|----------------|-----------|
| **Dashboard** | Métricas de vendas e pedidos |
| **Gestão de Produtos** | CRUD completo com upload de imagens |
| **Gestão de Pedidos** | Workflow de status e notificações |
| **Cupons de Desconto** | Criação e gestão de promoções |
| **Newsletter** | Gestão de assinantes |
| **Carrinho Abandonado** | Recuperação automática |

### 📱 PWA
| Funcionalidade | Descrição |
|----------------|-----------|
| **Instalável** | Adicionar à tela inicial |
| **Offline** | Cache de recursos essenciais |
| **Push Notifications** | Notificações de pedidos |

---

## 🛠 Stack Tecnológico

### Backend

| Tecnologia | Descrição |
|------------|-----------|
| **Django** | Framework web Python |
| **Django REST Framework** | APIs RESTful |
| **Simple JWT** | Autenticação JWT |
| **PostgreSQL** | Banco de dados (produção) |
| **SQLite** | Banco de dados (desenvolvimento) |
| **Pillow** | Processamento de imagens |
| **Mercado Pago SDK** | Integração de pagamentos |
| **SendGrid** | Envio de emails transacionais |
| **Cloudflare R2** | Storage de mídia (S3-compatible) |

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **React** | 18.2 | Biblioteca de UI |
| **Vite** | 5.4 | Build tool |
| **TailwindCSS** | 3.4 | Framework CSS |
| **React Router** | 6.26 | Roteamento SPA |
| **Axios** | 1.7 | Cliente HTTP |
| **Chart.js** | 4.4 | Gráficos e visualizações |
| **Lucide React** | 0.548 | Ícones |
| **React Hot Toast** | 2.4 | Notificações |
| **Workbox** | 7.0 | Service Worker para PWA |

### Infraestrutura

| Serviço | Uso |
|---------|-----|
| **Railway** | Deploy backend e banco de dados |
| **Netlify/Vercel** | Deploy frontend (opcional) |
| **Cloudflare R2** | Storage de imagens e PDFs |
| **SendGrid** | Email transacional |

---

## 🏗 Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Base Corporativa                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐         ┌─────────────────┐                    │
│  │   React SPA     │◄───────►│   Django API    │                    │
│  │   (Frontend)    │  REST   │   (Backend)     │                    │
│  │                 │  JSON   │                 │                    │
│  │  • Catálogo     │         │  • Auth JWT     │                    │
│  │  • Carrinho     │         │  • Products     │                    │
│  │  • Checkout     │         │  • Orders       │                    │
│  │  • PWA          │         │  • Payments     │                    │
│  └─────────────────┘         └────────┬────────┘                    │
│                                       │                              │
│         ┌─────────────────────────────┼─────────────────────────┐   │
│         │                             │                          │   │
│         ▼                             ▼                          ▼   │
│  ┌─────────────┐            ┌─────────────────┐          ┌──────────┐│
│  │ PostgreSQL  │            │  Mercado Pago   │          │   R2     ││
│  │  (Database) │            │   (Payments)    │          │ (Storage)││
│  └─────────────┘            └─────────────────┘          └──────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Instalação

### Pré-requisitos

- **Python** 3.10+
- **Node.js** 18+
- **PostgreSQL** 14+ (produção) ou SQLite (desenvolvimento)

### 1. Clone o Repositório

```bash
git clone https://github.com/LeonardoRFragoso/base-corporativa.git
cd base-corporativa
```

### 2. Configuração do Backend

```bash
# Entrar no diretório do backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Executar migrações
python manage.py migrate

# Criar superusuário (admin)
python manage.py createsuperuser

# Popular dados iniciais (opcional)
python populate_products.py
python populate_loyalty_tiers.py

# Iniciar servidor de desenvolvimento
python manage.py runserver
```

### 3. Configuração do Frontend

```bash
# Em outro terminal, entrar no diretório do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### 4. Acessar a Aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/

---

## ⚙ Configuração

### Variáveis de Ambiente (Backend)

Crie o arquivo `.env` no diretório `backend/`:

```env
# Django
DEBUG=True
SECRET_KEY=sua-chave-secreta-aqui
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (desenvolvimento)
DATABASE_URL=sqlite:///db.sqlite3

# Database (produção)
# DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET_KEY=sua-jwt-secret-key
ACCESS_TOKEN_LIFETIME_HOURS=24
REFRESH_TOKEN_LIFETIME_DAYS=7

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu-access-token
MERCADOPAGO_PUBLIC_KEY=sua-public-key

# Cloudflare R2 (Storage)
R2_ACCOUNT_ID=seu-account-id
R2_ACCESS_KEY_ID=sua-access-key
R2_SECRET_ACCESS_KEY=sua-secret-key
R2_BUCKET_NAME=base-corporativa
R2_ENDPOINT_URL=https://account-id.r2.cloudflarestorage.com

# SendGrid (Email)
SENDGRID_API_KEY=sua-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@basecorporativa.store

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173
```

### Variáveis de Ambiente (Frontend)

Crie o arquivo `.env.production` no diretório `frontend/`:

```env
VITE_API_URL=https://seu-backend.railway.app/api
VITE_MERCADOPAGO_PUBLIC_KEY=sua-public-key
```

---

## 📡 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/users/register/` | Registro de usuário |
| `POST` | `/api/users/login/` | Login (retorna JWT) |
| `POST` | `/api/users/token/refresh/` | Refresh do token |
| `GET` | `/api/users/profile/` | Perfil do usuário |

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/catalog/products/` | Listar produtos |
| `GET` | `/api/catalog/products/:id/` | Detalhes do produto |
| `GET` | `/api/catalog/categories/` | Listar categorias |
| `GET` | `/api/catalog/products/featured/` | Produtos em destaque |

### Carrinho

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/cart/` | Ver carrinho |
| `POST` | `/api/cart/add/` | Adicionar item |
| `PUT` | `/api/cart/update/:id/` | Atualizar quantidade |
| `DELETE` | `/api/cart/remove/:id/` | Remover item |

### Pedidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/orders/` | Listar pedidos do usuário |
| `GET` | `/api/orders/:id/` | Detalhes do pedido |
| `POST` | `/api/orders/create/` | Criar pedido |

### Pagamentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/payments/create-preference/` | Criar preferência Mercado Pago |
| `POST` | `/api/payments/webhook/` | Webhook de notificações |

---

## ☁ Deploy

### Railway (Recomendado)

O projeto inclui configuração pronta para Railway:

1. **Crie um projeto no Railway**
2. **Conecte o repositório GitHub**
3. **Configure as variáveis de ambiente**
4. **O deploy é automático**

Arquivos de configuração incluídos:
- `railway.toml` - Configuração do Railway
- `nixpacks.toml` - Build configuration
- `Procfile` - Comando de inicialização

### Build de Produção (Frontend)

```bash
cd frontend
npm run build
```

Os arquivos de produção serão gerados em `dist/`.

---

## 📁 Estrutura do Projeto

```
base-corporativa/
├── backend/
│   ├── abandoned_cart/      # Recuperação de carrinhos abandonados
│   ├── addresses/           # Gestão de endereços
│   ├── analytics/           # Tracking e métricas
│   ├── blog/                # Sistema de blog/conteúdo
│   ├── cart/                # Carrinho de compras
│   ├── catalog/             # Produtos e categorias
│   ├── core/                # Configurações Django
│   ├── discounts/           # Cupons de desconto
│   ├── giftcards/           # Vales-presente
│   ├── loyalty/             # Programa de fidelidade
│   ├── newsletter/          # Gestão de newsletter
│   ├── notifications/       # Sistema de notificações
│   ├── orders/              # Pedidos
│   ├── payments/            # Integração Mercado Pago
│   ├── promotions/          # Promoções e ofertas
│   ├── recommendations/     # Sistema de recomendações
│   ├── reviews/             # Avaliações de produtos
│   ├── shipping/            # Cálculo de frete
│   ├── users/               # Autenticação e perfis
│   ├── wishlist/            # Lista de desejos
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/              # Assets estáticos
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços de API
│   │   ├── contexts/        # Context API
│   │   └── utils/           # Utilitários
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── MD/                      # Documentação adicional
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🧪 Testes

### Backend

```bash
cd backend
python manage.py test
```

### Verificar Sistema

```bash
python verify_system.py
```

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Leonardo Fragoso**

- GitHub: [@LeonardoRFragoso](https://github.com/LeonardoRFragoso)
- LinkedIn: [Leonardo Fragoso](https://www.linkedin.com/in/leonardo-fragoso-921b166a/)
- Website: [basecorporativa.store](https://basecorporativa.store/)

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

</div>
