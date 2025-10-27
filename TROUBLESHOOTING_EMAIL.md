# 🔍 Troubleshooting - Email de Verificação

## ✅ Status Atual

- **Configuração SMTP:** ✅ Funcionando
- **Teste manual:** ✅ Email enviado com sucesso
- **Email usado:** contato@basecorporativa.store
- **Servidor:** smtp.hostinger.com:465 (SSL)

## 🐛 Problema Reportado

Usuário se cadastra mas não recebe email de verificação.

## 📋 Checklist de Verificação

### 1. Verificar Logs do Backend

Quando um usuário se cadastra, o backend agora mostra logs detalhados:

```bash
# Terminal do backend deve mostrar:
✅ Email de verificação enviado para: usuario@email.com

# OU em caso de erro:
❌ Erro ao enviar email de verificação para usuario@email.com: [detalhes do erro]
```

### 2. Verificar se o Backend está Rodando

```bash
cd backend
python manage.py runserver
```

### 3. Verificar Configurações de Email

**Arquivo:** `backend/.env`

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USE_SSL=True
EMAIL_HOST_USER=contato@basecorporativa.store
EMAIL_HOST_PASSWORD=Valentina@2308@
DEFAULT_FROM_EMAIL=BASE CORPORATIVA <contato@basecorporativa.store>
```

### 4. Testar Envio Manual

```bash
cd backend
python test_send_verification.py
```

Deve mostrar:
```
✅ Email enviado com sucesso!
📬 Verifique a caixa de entrada de: email@usuario.com
```

### 5. Verificar Caixa de Spam

⚠️ **IMPORTANTE:** Emails podem cair na caixa de spam, especialmente:
- Gmail
- Outlook/Hotmail
- Yahoo

### 6. Verificar Token no Banco de Dados

```bash
cd backend
python manage.py shell
```

```python
from users.models import EmailVerificationToken
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(email='email@usuario.com')

# Ver tokens do usuário
tokens = EmailVerificationToken.objects.filter(user=user)
for token in tokens:
    print(f"Token: {token.token}")
    print(f"Criado: {token.created_at}")
    print(f"Expira: {token.expires_at}")
    print(f"Usado: {token.used}")
    print(f"Válido: {token.is_valid()}")
    print("---")
```

## 🔧 Possíveis Causas

### 1. Backend não está rodando
**Solução:** Iniciar o servidor Django

### 2. Erro na configuração SMTP
**Solução:** Verificar credenciais no `.env`

### 3. Firewall bloqueando porta 465
**Solução:** Verificar firewall do Windows/antivírus

### 4. Limite de envio da Hostinger
**Solução:** Verificar no painel da Hostinger se há limites atingidos

### 5. Email caiu no spam
**Solução:** Verificar pasta de spam do usuário

### 6. Email do usuário inválido
**Solução:** Verificar se o email foi digitado corretamente

## 🧪 Teste Completo do Fluxo

### Passo 1: Limpar dados de teste
```bash
cd backend
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
User = get_user_model()

# Deletar usuário de teste se existir
try:
    user = User.objects.get(username='teste_email')
    user.delete()
    print("✅ Usuário de teste deletado")
except:
    print("ℹ️ Usuário não existe")
```

### Passo 2: Cadastrar novo usuário
1. Acessar: `http://localhost:5173/register`
2. Preencher formulário:
   - Usuário: `teste_email`
   - Email: `seu_email_real@gmail.com`
   - Senha: `teste123`
3. Clicar em "Criar conta"

### Passo 3: Verificar logs
Olhar no terminal do backend:
```
✅ Email de verificação enviado para: seu_email_real@gmail.com
```

### Passo 4: Verificar email
1. Abrir caixa de entrada
2. Verificar pasta de spam
3. Procurar email de "BASE CORPORATIVA"

### Passo 5: Clicar no link
Link será algo como:
```
http://localhost:5173/verificar-email/[token-uuid]
```

## 📊 Logs Úteis

### Ver todos os tokens criados hoje
```python
from users.models import EmailVerificationToken
from datetime import datetime, timedelta

hoje = datetime.now().date()
tokens = EmailVerificationToken.objects.filter(
    created_at__date=hoje
).select_related('user')

for token in tokens:
    print(f"Usuário: {token.user.username}")
    print(f"Email: {token.user.email}")
    print(f"Token: {token.token}")
    print(f"Usado: {token.used}")
    print(f"Válido: {token.is_valid()}")
    print("---")
```

## 🚨 Em Produção (Railway)

### Verificar Logs
```bash
railway logs
```

### Verificar Variáveis de Ambiente
No painel do Railway, verificar se todas as variáveis de email estão configuradas:
- EMAIL_BACKEND
- EMAIL_HOST
- EMAIL_PORT
- EMAIL_USE_SSL
- EMAIL_HOST_USER
- EMAIL_HOST_PASSWORD
- DEFAULT_FROM_EMAIL

## 📞 Suporte

Se o problema persistir:

1. **Coletar informações:**
   - Logs do backend
   - Email do usuário
   - Horário do cadastro
   - Mensagem de erro (se houver)

2. **Verificar com a Hostinger:**
   - Limite de envio de emails
   - Status do servidor SMTP
   - Bloqueios de segurança

3. **Testar com outro email:**
   - Tentar com Gmail
   - Tentar com Outlook
   - Tentar com email corporativo

---

**Última atualização:** 27/10/2025  
**Status:** Sistema funcionando - Email de teste enviado com sucesso
