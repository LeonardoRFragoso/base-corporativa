# 🚀 Deploy Rápido na Hostinger

## ⚡ Passo a Passo Simplificado

### 1️⃣ Preparar Arquivos (No seu computador)

```powershell
# Execute o script de build
.\build-for-deploy.ps1
```

**OU manualmente:**

```powershell
cd frontend
npm install
npm run build
```

Isso criará a pasta `frontend/dist/` com todos os arquivos.

---

### 2️⃣ Configurar URL da API

**Antes do build**, edite `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://sua-api.com
```

⚠️ **IMPORTANTE:** Se mudar isso, rode `npm run build` novamente!

---

### 3️⃣ Upload na Hostinger

#### Opção A: File Manager (Como na imagem)

1. **Login na Hostinger**
   - Acesse: https://hpanel.hostinger.com
   - Faça login

2. **Abra o File Manager**
   - Painel → Arquivos → Gerenciador de Arquivos
   - Ou clique no ícone de pasta

3. **Navegue até public_html**
   - Clique em `public_html/`
   - Esta é a pasta raiz do seu site

4. **Limpe arquivos antigos**
   - Selecione todos os arquivos
   - Clique em "Delete" (faça backup antes!)
   - ⚠️ NÃO delete `.htaccess` se existir

5. **Faça Upload**
   - Clique em "Upload" (botão roxo, como na imagem)
   - Selecione TODOS os arquivos de `frontend/dist/`
   - **IMPORTANTE:** Selecione os arquivos DENTRO de dist/, não a pasta dist/
   
   ```
   Selecione:
   ✅ index.html
   ✅ pasta assets/
   ✅ .htaccess
   ✅ todos os outros arquivos
   
   NÃO selecione:
   ❌ a pasta "dist" em si
   ```

6. **Aguarde o Upload**
   - Barra de progresso aparecerá
   - Aguarde até 100%

7. **Verifique**
   - Acesse seu domínio no navegador
   - Exemplo: https://seusite.com

---

### 4️⃣ Verificar .htaccess

Se o site não funcionar nas rotas (ex: /about dá erro 404):

1. Verifique se `.htaccess` existe em `public_html/`
2. Se não existir, crie com este conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 📋 Checklist Rápido

### Antes do Upload
- [ ] Editou `.env.production` com URL da API
- [ ] Rodou `npm run build`
- [ ] Verificou que pasta `dist/` foi criada

### Durante Upload
- [ ] Limpou `public_html/` (backup antes!)
- [ ] Selecionou arquivos DENTRO de `dist/`
- [ ] Upload de `index.html` ✓
- [ ] Upload de pasta `assets/` ✓
- [ ] Upload de `.htaccess` ✓

### Depois do Upload
- [ ] Acessou o site no navegador
- [ ] Testou rota principal (/)
- [ ] Testou outras rotas (/about, /catalog)
- [ ] Verificou console (F12) - sem erros críticos

---

## 🆘 Problemas Comuns

### ❌ Página em branco
**Solução:** Verifique se todos os arquivos foram enviados, especialmente `index.html`

### ❌ Erro 404 nas rotas (/about, /catalog)
**Solução:** Crie/verifique arquivo `.htaccess`

### ❌ Imagens não aparecem
**Solução:** Verifique se a pasta `assets/` foi enviada completamente

### ❌ API não responde
**Solução:** 
1. Verifique `VITE_API_BASE_URL` em `.env.production`
2. Rode `npm run build` novamente
3. Faça upload novamente

---

## 🎯 Estrutura Final em public_html/

```
public_html/
├── index.html              ← Página principal
├── .htaccess              ← Configuração de rotas
├── assets/                ← CSS, JS, imagens
│   ├── index-abc123.js
│   ├── index-abc123.css
│   └── [imagens]
└── [outros arquivos do build]
```

---

## 🔄 Para Atualizar o Site

1. Faça mudanças no código
2. Rode `npm run build` novamente
3. Faça upload dos arquivos novos
4. Limpe cache do navegador (Ctrl+Shift+R)

---

## 📞 Ajuda

- **Guia Completo:** Veja `DEPLOY_GUIDE.md`
- **Suporte Hostinger:** Chat no hPanel
- **Documentação:** https://support.hostinger.com

---

**Tempo estimado:** 10-15 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)
