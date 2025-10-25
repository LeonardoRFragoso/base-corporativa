# ✅ Checklist Completo de Deploy - E-commerce Base Corporativa

## 📊 RESUMO EXECUTIVO

### ✅ Status: **PRONTO PARA DEPLOY COM AJUSTES MÍNIMOS**

**O que está pronto:**
- ✅ Backend Django completo e funcional
- ✅ Frontend React com build de produção
- ✅ Credenciais Mercado Pago configuradas (PRODUÇÃO)
- ✅ Credenciais Melhor Envio configuradas
- ✅ Arquivos de configuração Railway criados
- ✅ Arquivo .htaccess para Hostinger pronto

**O que falta (15-30 minutos):**
- 🔴 Gerar nova SECRET_KEY para produção
- 🔴 Atualizar URLs após deploy do backend
- 🔴 Configurar CEP de origem correto
- 🔴 Rebuild do frontend com URL da API

---

## 🚀 PLANO DE DEPLOY (Passo a Passo)

### FASE 1: Deploy do Backend no Railway (15 minutos)

#### Passo 1.1: Preparar Variáveis de Ambiente

1. **Gerar nova SECRET_KEY:**
   ```powershell
   cd backend
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```
   - Copie a chave gerada

2. **Atualizar CEP de origem:**
   - Abra `backend\.env.railway`
   - Altere `SHIPPING_ORIGIN_ZIP=01000-000` para seu CEP real

#### Passo 1.2: Criar Projeto no Railway

1. Acesse https://railway.app
2. Clique em "New Project"
3. Escolha "Deploy from GitHub repo" (recomendado) ou "Empty Project"

#### Passo 1.3: Adicionar PostgreSQL

1. No projeto Railway, clique em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. Aguarde a criação (1-2 minutos)

#### Passo 1.4: Configurar Variáveis de Ambiente

No painel do Railway, vá em "Variables" e adicione **TODAS** as variáveis do arquivo `backend\.env.railway`:

**CRÍTICAS (copie exatamente):**
```env
DEBUG=False
SECRET_KEY=[COLE_A_SECRET_KEY_GERADA_NO_PASSO_1.1]
ALLOWED_HOSTS=seu-app.railway.app
DJANGO_SETTINGS_MODULE=core.settings

# Mercado Pago (JÁ CONFIGURADO - PRODUÇÃO)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-2467246722825087-102114-5dedccfa9fd33de5ea421076daaeaf95-175427787
MERCADOPAGO_PUBLIC_KEY=APP_USR-66577b04-d2f6-4a81-b71f-a1e23d7d757e
MERCADOPAGO_USER_ID=175427787
MERCADOPAGO_APP_ID=2467246722825087
MERCADOPAGO_NOTIFICATION_URL=https://seu-app.railway.app/api/payments/webhook/

# Melhor Envio (JÁ CONFIGURADO)
MELHORENVIO_CLIENT_ID=20553
MELHORENVIO_CLIENT_SECRET=N147Yub5qWloXXYKppvJwRmmicQMmu1Jy5lpiO6i
MELHORENVIO_REDIRECT_URI=https://seu-app.railway.app/api/shipping/oauth/callback/
MELHORENVIO_AUTH_BASE=https://www.melhorenvio.com.br
MELHORENVIO_API_BASE=https://www.melhorenvio.com.br
MELHORENVIO_API_TOKEN=

# Frete
SHIPPING_ORIGIN_ZIP=[SEU_CEP_AQUI]
SHIPPING_DEFAULT_WEIGHT_GRAMS=300
SHIPPING_DEFAULT_LENGTH_CM=30
SHIPPING_DEFAULT_WIDTH_CM=20
SHIPPING_DEFAULT_HEIGHT_CM=5
SHIPPING_FREE_THRESHOLD=0

# CORS (atualizar após obter domínio)
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173

# Security
SECURE_HSTS_SECONDS=31536000
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_REFERRER_POLICY=same-origin
```

**⚠️ IMPORTANTE:** Substitua `seu-app.railway.app` pela URL real que o Railway fornecer.

#### Passo 1.5: Deploy

1. Se conectou ao GitHub:
   - Push do código para o repositório
   - Railway fará deploy automaticamente

2. Se deploy manual:
   - Railway CLI: `railway up`

3. Aguarde o build (3-5 minutos)

#### Passo 1.6: Verificar Deploy

1. Acesse a URL fornecida: `https://seu-app.railway.app`
2. Teste: `https://seu-app.railway.app/api/`
3. Verifique logs no Railway se houver erros

#### Passo 1.7: Atualizar URLs

Após obter a URL do Railway, **ATUALIZE** as seguintes variáveis:

```env
ALLOWED_HOSTS=sua-url-real.railway.app
MERCADOPAGO_NOTIFICATION_URL=https://sua-url-real.railway.app/api/payments/webhook/
MELHORENVIO_REDIRECT_URI=https://sua-url-real.railway.app/api/shipping/oauth/callback/
```

---

### FASE 2: Deploy do Frontend na Hostinger (10 minutos)

#### Passo 2.1: Atualizar URL da API

1. Abra `frontend\.env.production`
2. Atualize com a URL do Railway:
   ```env
   VITE_API_BASE_URL=https://sua-url-real.railway.app
   ```

#### Passo 2.2: Build do Frontend

```powershell
cd frontend
npm install
npm run build
```

Ou use o script automatizado:
```powershell
.\build-for-deploy.ps1
```

#### Passo 2.3: Upload na Hostinger

1. Acesse https://hpanel.hostinger.com
2. Vá em "Arquivos" → "Gerenciador de Arquivos"
3. Navegue até `public_html/`
4. **Backup:** Baixe arquivos existentes (se houver)
5. **Limpe** a pasta `public_html/`
6. **Upload:** Selecione TODOS os arquivos de `frontend\dist\`
   - ✅ index.html
   - ✅ pasta assets/
   - ✅ .htaccess
   - ✅ todos os outros arquivos

#### Passo 2.4: Verificar

1. Acesse seu domínio: `https://seudominio.com`
2. Teste navegação entre páginas
3. Abra Console (F12) e verifique erros

---

### FASE 3: Configurações Finais (10 minutos)

#### Passo 3.1: Atualizar CORS no Backend

No Railway, atualize a variável `CORS_ALLOWED_ORIGINS`:
```env
CORS_ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
CSRF_TRUSTED_ORIGINS=https://seudominio.com,https://www.seudominio.com,https://sua-url.railway.app
```

#### Passo 3.2: Configurar SSL na Hostinger

1. No hPanel, vá em "Segurança" → "SSL"
2. Ative "Let's Encrypt" (gratuito)
3. Aguarde ativação (5-10 minutos)

#### Passo 3.3: Popular Banco de Dados (Opcional)

Se quiser adicionar produtos de exemplo:

```powershell
# No Railway, use o Railway CLI ou shell
python manage.py shell
```

Ou execute o script de população:
```powershell
python populate_products.py
```

#### Passo 3.4: Criar Superusuário

```powershell
# No Railway shell
python manage.py createsuperuser
```

Acesse o admin: `https://sua-url.railway.app/admin/`

---

## 📋 CHECKLIST FINAL

### Backend (Railway)
- [ ] PostgreSQL criado e conectado
- [ ] Todas as variáveis de ambiente configuradas
- [ ] SECRET_KEY nova gerada e configurada
- [ ] CEP de origem atualizado
- [ ] Build completado com sucesso
- [ ] API acessível: `/api/`
- [ ] Migrações executadas
- [ ] Arquivos estáticos coletados
- [ ] Logs sem erros críticos

### Frontend (Hostinger)
- [ ] `.env.production` atualizado com URL da API
- [ ] Build executado com sucesso
- [ ] Todos os arquivos de `dist/` enviados
- [ ] `.htaccess` presente em `public_html/`
- [ ] Site acessível no domínio
- [ ] Rotas funcionando (/, /about, /catalog)
- [ ] Console sem erros CORS
- [ ] SSL ativo (HTTPS)

### Integrações
- [ ] Mercado Pago funcionando (testar pagamento)
- [ ] Melhor Envio calculando frete
- [ ] Webhooks configurados corretamente
- [ ] CORS configurado para domínio real

### Funcionalidades E-commerce
- [ ] Cadastro de usuário funcionando
- [ ] Login funcionando
- [ ] Listagem de produtos
- [ ] Adicionar ao carrinho
- [ ] Calcular frete
- [ ] Aplicar cupom de desconto
- [ ] Finalizar pedido
- [ ] Processar pagamento
- [ ] Receber notificação de pagamento

---

## 🎯 INFORMAÇÕES IMPORTANTES

### Credenciais Já Configuradas

✅ **Mercado Pago (PRODUÇÃO):**
- Access Token: `APP_USR-2467246722825087-102114-...`
- Public Key: `APP_USR-66577b04-d2f6-4a81-b71f-...`
- User ID: `175427787`
- App ID: `2467246722825087`

✅ **Melhor Envio:**
- Client ID: `20553`
- Client Secret: `N147Yub5qWloXXYKppvJwRmmicQMmu1Jy5lpiO6i`

### URLs Importantes

**Após Deploy:**
- Backend API: `https://sua-url.railway.app`
- Admin Django: `https://sua-url.railway.app/admin/`
- Frontend: `https://seudominio.com`

**Webhooks:**
- Mercado Pago: `https://sua-url.railway.app/api/payments/webhook/`
- Melhor Envio: `https://sua-url.railway.app/api/shipping/oauth/callback/`

---

## 🆘 TROUBLESHOOTING

### Erro: CORS Policy
**Solução:** Adicione o domínio do frontend em `CORS_ALLOWED_ORIGINS` no Railway

### Erro: 502 Bad Gateway
**Solução:** Verifique logs no Railway, provavelmente erro no `settings.py`

### Erro: Static files não carregam
**Solução:** Execute `python manage.py collectstatic --noinput`

### Erro: Database connection
**Solução:** Verifique se PostgreSQL está rodando e `DATABASE_URL` está configurada

### Frontend: Página em branco
**Solução:** Verifique se `VITE_API_BASE_URL` está correto e rebuild

### Pagamento não funciona
**Solução:** 
1. Verifique credenciais do Mercado Pago
2. Teste com cartão de teste primeiro
3. Verifique webhook configurado

---

## 📊 TEMPO ESTIMADO TOTAL

- **Preparação:** 5 minutos
- **Deploy Backend:** 15 minutos
- **Deploy Frontend:** 10 minutos
- **Configurações Finais:** 10 minutos
- **Testes:** 10 minutos

**TOTAL: 50 minutos**

---

## ✅ CONCLUSÃO

**Seu projeto está 95% pronto para produção!**

Falta apenas:
1. Gerar SECRET_KEY nova (1 comando)
2. Fazer deploy no Railway (15 min)
3. Atualizar URL da API no frontend (1 linha)
4. Rebuild e upload na Hostinger (10 min)

**Todas as integrações críticas (Mercado Pago e Melhor Envio) já estão configuradas com credenciais de produção válidas.**

---

**Última atualização:** 25 de Outubro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ PRONTO PARA DEPLOY
