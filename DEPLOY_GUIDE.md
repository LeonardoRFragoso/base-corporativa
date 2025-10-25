# Guia de Deploy - BASE CORPORATIVA na Hostinger

## 📋 Pré-requisitos

- Conta na Hostinger com hospedagem web
- Acesso ao painel de controle (hPanel)
- FTP ou File Manager da Hostinger
- Node.js instalado localmente (para build)

## 🏗️ Preparação dos Arquivos

### 1. Build do Frontend

O frontend React precisa ser compilado para arquivos estáticos (HTML, CSS, JS).

**Passo a passo:**

```bash
# 1. Navegue até a pasta do frontend
cd frontend

# 2. Instale as dependências (se ainda não instalou)
npm install

# 3. Faça o build de produção
npm run build
```

Isso criará uma pasta `dist/` com todos os arquivos otimizados.

### 2. Estrutura de Arquivos para Upload

Após o build, você terá:

```
frontend/dist/
├── index.html          # Página principal
├── assets/
│   ├── index-[hash].js    # JavaScript compilado
│   ├── index-[hash].css   # CSS compilado
│   └── [imagens]          # Imagens otimizadas
└── [outros arquivos]
```

## 📤 Upload para Hostinger

### Opção 1: File Manager (Mais Fácil)

1. **Acesse o hPanel da Hostinger**
   - Login em hpanel.hostinger.com
   - Selecione seu domínio

2. **Abra o File Manager**
   - Vá em "Arquivos" → "Gerenciador de Arquivos"
   - Navegue até `public_html/` (pasta raiz do site)

3. **Limpe a pasta (se necessário)**
   - Delete arquivos padrão da Hostinger
   - Mantenha `.htaccess` se existir

4. **Faça Upload dos Arquivos**
   - Clique em "Upload" (como na imagem)
   - Selecione TODOS os arquivos da pasta `frontend/dist/`
   - Arraste ou clique em "Carregar"
   - Aguarde o upload completar

5. **Estrutura Final em public_html/**
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-[hash].js
   │   ├── index-[hash].css
   │   └── [imagens]
   └── .htaccess (criar se não existir)
   ```

### Opção 2: FTP (Para uploads grandes)

1. **Obtenha credenciais FTP**
   - hPanel → Arquivos → Contas FTP
   - Anote: Host, Usuário, Senha

2. **Use um cliente FTP**
   - FileZilla (recomendado)
   - WinSCP
   - Ou qualquer cliente FTP

3. **Conecte e faça upload**
   - Host: ftp.seudominio.com
   - Porta: 21
   - Navegue até `public_html/`
   - Arraste pasta `dist/` inteira

## ⚙️ Configuração do .htaccess

Para o React Router funcionar corretamente, crie um arquivo `.htaccess` em `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirecionar para HTTPS (recomendado)
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # React Router - redirecionar tudo para index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Compressão GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache de arquivos estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>
```

## 🔧 Configuração de Variáveis de Ambiente

### Arquivo .env.production

Antes do build, configure as variáveis de ambiente em `frontend/.env.production`:

```env
# URL da API (backend)
VITE_API_BASE_URL=https://api.seudominio.com

# URL do catálogo PDF (se aplicável)
VITE_CATALOG_PDF_URL=https://seudominio.com/media/catalog/catalogo.pdf
```

**IMPORTANTE:** Reconstrua após alterar variáveis:
```bash
npm run build
```

## 🚀 Backend (Django)

### Opção A: Backend na Hostinger (VPS/Cloud)

Se você tem VPS ou Cloud Hosting:

1. **Instale Python e dependências**
2. **Configure Gunicorn + Nginx**
3. **Configure variáveis de ambiente**
4. **Rode migrações**
5. **Colete arquivos estáticos**

### Opção B: Backend em outro serviço (Recomendado)

Para hospedagem compartilhada, é melhor hospedar o backend separadamente:

- **Railway.app** (gratuito para começar)
- **Render.com** (gratuito)
- **PythonAnywhere** (gratuito com limitações)
- **Heroku** (pago)

## 📝 Checklist de Deploy

### Antes do Upload

- [ ] Build do frontend (`npm run build`)
- [ ] Configurar `.env.production` com URL da API
- [ ] Testar build localmente (`npm run preview`)
- [ ] Verificar se todas as imagens estão otimizadas

### Durante o Upload

- [ ] Limpar `public_html/` (backup antes!)
- [ ] Upload de todos os arquivos de `dist/`
- [ ] Criar/atualizar `.htaccess`
- [ ] Verificar permissões dos arquivos (644 para arquivos, 755 para pastas)

### Após o Upload

- [ ] Testar site no navegador
- [ ] Verificar todas as rotas (/, /about, /catalog, etc.)
- [ ] Testar em diferentes dispositivos
- [ ] Verificar console do navegador (F12) para erros
- [ ] Testar formulários e funcionalidades
- [ ] Configurar SSL/HTTPS (Hostinger oferece Let's Encrypt grátis)

## 🔍 Troubleshooting

### Página em branco

**Causa:** Caminhos incorretos dos assets

**Solução:** Verifique `vite.config.js`:
```javascript
export default defineConfig({
  base: '/', // Deve ser '/' para domínio raiz
  // ...
})
```

### Erro 404 nas rotas

**Causa:** `.htaccess` não configurado

**Solução:** Crie o arquivo `.htaccess` conforme acima

### Imagens não carregam

**Causa:** Caminhos relativos incorretos

**Solução:** Use caminhos absolutos ou importe imagens no código

### API não responde

**Causa:** CORS ou URL da API incorreta

**Solução:** 
1. Verifique `VITE_API_BASE_URL` em `.env.production`
2. Configure CORS no backend Django

## 🔄 Atualizações Futuras

Para atualizar o site:

1. Faça alterações no código
2. Rode `npm run build` novamente
3. Faça upload apenas dos arquivos alterados
4. Ou substitua toda a pasta `public_html/`

## 📊 Otimizações Recomendadas

### Performance

- [ ] Habilitar compressão GZIP (via `.htaccess`)
- [ ] Configurar cache de navegador
- [ ] Otimizar imagens (WebP, compressão)
- [ ] Minificar CSS/JS (Vite já faz isso)

### SEO

- [ ] Adicionar meta tags (já incluídas no `index.html`)
- [ ] Configurar sitemap.xml
- [ ] Configurar robots.txt
- [ ] Google Analytics (se necessário)

### Segurança

- [ ] Forçar HTTPS (via `.htaccess`)
- [ ] Configurar headers de segurança
- [ ] Manter dependências atualizadas

## 🆘 Suporte

### Recursos Hostinger

- Documentação: https://support.hostinger.com
- Chat ao vivo: Disponível no hPanel
- Tutoriais: YouTube Hostinger Brasil

### Problemas Comuns

1. **Upload lento:** Use FTP ao invés do File Manager
2. **Limite de upload:** Divida em partes menores
3. **Permissões:** Arquivos 644, pastas 755
4. **Cache:** Limpe cache do navegador (Ctrl+Shift+R)

## 📞 Contato

Para dúvidas específicas do projeto, consulte:
- README.md principal
- ADMIN_GUIDE.md (para funcionalidades admin)
- DESIGN_SYSTEM.md (para design)

---

**Última atualização:** 25 de Outubro de 2025  
**Versão:** 1.0.0
