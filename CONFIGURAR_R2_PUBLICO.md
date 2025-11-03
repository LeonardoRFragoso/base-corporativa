# 🔧 Como Configurar Acesso Público no Cloudflare R2

## ❌ Problema Atual:
As imagens estão no R2, mas retornam 404 porque o bucket não está configurado para acesso público.

---

## ✅ Solução: Configurar Public Access

### Passo 1: Acessar o Cloudflare Dashboard
1. Acesse: https://dash.cloudflare.com/
2. Faça login com sua conta
3. Vá em **R2** no menu lateral

### Passo 2: Selecionar o Bucket
1. Clique no bucket **`base-corporativa-media`**

### Passo 3: Configurar Public Access
1. Clique na aba **Settings**
2. Role até a seção **Public Access**
3. Clique em **Allow Access** ou **Connect Domain**

### Passo 4: Opções de Configuração

#### Opção A: R2.dev Subdomain (Mais Rápido)
1. Clique em **Allow Access**
2. Isso vai gerar uma URL pública automática
3. A URL será algo como: `https://pub-xxxxx.r2.dev`

#### Opção B: Custom Domain (Mais Profissional)
1. Clique em **Connect Domain**
2. Digite um subdomínio: `media.basecorporativa.store`
3. Siga as instruções para configurar o DNS
4. Aguarde propagação (pode levar alguns minutos)

---

## 🎯 Configuração Recomendada

### Para o bucket `base-corporativa-media`:

1. **Public Access:** Enabled
2. **R2.dev Subdomain:** Enabled
3. **CORS Policy:** Configurar (veja abaixo)

### CORS Policy (Opcional mas Recomendado):

```json
[
  {
    "AllowedOrigins": [
      "https://basecorporativa.store",
      "https://www.basecorporativa.store"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 🔍 Como Verificar se Funcionou

Após configurar, teste uma URL diretamente no navegador:

```
https://pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev/base-corporativa-media/products/oversized_preta_1.png
```

**Se funcionar:** ✅ Configuração correta!  
**Se der 404:** ❌ Ainda precisa configurar o acesso público

---

## ⚠️ IMPORTANTE

Depois de habilitar o acesso público:

1. **Aguarde 1-2 minutos** para propagação
2. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
3. **Recarregue a página** (Ctrl+F5)

---

## 🆘 Se Não Conseguir Configurar

Me avise e posso:
1. Te guiar passo a passo com prints
2. Sugerir alternativas
3. Configurar via API do Cloudflare

---

## 📝 Checklist

- [ ] Acessei o Cloudflare Dashboard
- [ ] Encontrei o bucket `base-corporativa-media`
- [ ] Habilitei Public Access
- [ ] Configurei CORS (opcional)
- [ ] Testei uma URL de imagem
- [ ] Limpei cache do navegador
- [ ] Recarreguei o site

---

**Após configurar, as imagens devem aparecer imediatamente!** ✅
