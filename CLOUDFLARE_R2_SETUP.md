# Configuração do Cloudflare R2 no Railway

## 🎯 Problema
As imagens não estão sendo enviadas para o bucket do Cloudflare R2 porque as variáveis de ambiente não estão configuradas no Railway.

## 📋 Passo a Passo

### 1. Obter Credenciais do Cloudflare R2

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vá em **R2** → **Overview**
3. Clique em **Manage R2 API Tokens**
4. Clique em **Create API Token**
5. Configure:
   - **Token Name**: `base-corporativa-railway`
   - **Permissions**: `Object Read & Write`
   - **Bucket**: `base-corporativa-media`
6. Clique em **Create API Token**
7. **IMPORTANTE**: Copie e salve:
   - **Access Key ID**
   - **Secret Access Key**
   - **Endpoint URL** (formato: `https://[account_id].r2.cloudflarestorage.com`)

### 2. Configurar Variáveis no Railway

1. Acesse o [Railway Dashboard](https://railway.app/)
2. Selecione seu projeto **base-corporativa-production**
3. Vá em **Variables**
4. Adicione as seguintes variáveis:

```bash
# Cloudflare R2 Configuration
AWS_STORAGE_BUCKET_NAME=base-corporativa-media
AWS_ACCESS_KEY_ID=<seu_access_key_id_aqui>
AWS_SECRET_ACCESS_KEY=<seu_secret_access_key_aqui>
AWS_S3_ENDPOINT_URL=https://<seu_account_id>.r2.cloudflarestorage.com
AWS_S3_CUSTOM_DOMAIN=pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev
AWS_S3_REGION_NAME=auto
AWS_S3_SIGNATURE_VERSION=s3v4
AWS_S3_ADDRESSING_STYLE=virtual
AWS_S3_FILE_OVERWRITE=False
AWS_QUERYSTRING_AUTH=False
```

### 3. Valores Específicos

Com base na sua imagem do Cloudflare:

- **Bucket Name**: `base-corporativa-media` ✅
- **Custom Domain**: `pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev` ✅
- **Account ID**: Você pode ver na URL do Cloudflare (formato: `4c77a...`)

### 4. Exemplo Completo

```bash
AWS_STORAGE_BUCKET_NAME=base-corporativa-media
AWS_ACCESS_KEY_ID=abc123def456ghi789jkl012mno345pq
AWS_SECRET_ACCESS_KEY=xyz789abc456def123ghi890jkl567mno234pqr
AWS_S3_ENDPOINT_URL=https://4c77a7d090f04ba6f0ba07d3c8fbc.r2.cloudflarestorage.com
AWS_S3_CUSTOM_DOMAIN=pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev
AWS_S3_REGION_NAME=auto
AWS_S3_SIGNATURE_VERSION=s3v4
AWS_S3_ADDRESSING_STYLE=virtual
AWS_S3_FILE_OVERWRITE=False
AWS_QUERYSTRING_AUTH=False
```

### 5. Após Configurar

1. O Railway vai **redeploy automaticamente**
2. Aguarde o deploy terminar (1-2 minutos)
3. Teste fazendo upload de uma imagem no admin
4. Verifique no Cloudflare R2 se a imagem apareceu

## ✅ Como Verificar se Funcionou

1. Faça upload de uma imagem no produto
2. Vá no Cloudflare R2 → `base-corporativa-media` bucket
3. Você deve ver a pasta `products/` com as imagens
4. No frontend, a imagem deve aparecer com a URL: `https://pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev/base-corporativa-media/products/nome-da-imagem.png`

## 🔧 Troubleshooting

### Erro: "Access Denied"
- Verifique se o API Token tem permissões de **Read & Write**
- Verifique se o token está associado ao bucket correto

### Erro: "Bucket not found"
- Verifique se o nome do bucket está correto: `base-corporativa-media`
- Verifique se o bucket existe no Cloudflare R2

### Imagens não aparecem
- Verifique se o bucket está com **Public Access** habilitado
- Verifique se o Custom Domain está configurado corretamente

## 📝 Notas Importantes

- **Nunca** commite as credenciais no Git
- As credenciais devem estar **apenas** no Railway (variáveis de ambiente)
- O `.env` local não precisa dessas variáveis (usa pasta `media/` local)
- Em produção, o Django automaticamente usa o R2 quando detecta `AWS_STORAGE_BUCKET_NAME`
