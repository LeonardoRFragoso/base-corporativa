# 🔐 SISTEMA DE AUTENTICAÇÃO - BASE CORPORATIVA

## ✅ STATUS: IMPLEMENTADO E FUNCIONAL

O sistema possui autenticação completa com verificação de email e recuperação de senha.

---

## 📋 FUNCIONALIDADES IMPLEMENTADAS

### 1. Registro de Usuário ✅
- Cadastro com email, username, senha
- Envio automático de email de verificação
- Token UUID v4 com validade de 24 horas

### 2. Verificação de Email ✅
- Link único enviado por email
- Token de uso único
- Expira em 24 horas

### 3. Login ✅
- Aceita email OU username
- Retorna JWT tokens (access + refresh)
- Validação de email verificado

### 4. Logout ✅
- Invalida refresh token
- Blacklist de tokens

### 5. Recuperação de Senha ✅
- Solicitar reset por email
- Token UUID v4 com validade de 1 hora
- Redefinir senha com token

### 6. Reenvio de Verificação ✅
- Reenviar email de verificação
- Para usuários não verificados

---

## 🔌 ENDPOINTS DA API

### Registro
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "usuario123",
  "email": "usuario@example.com",
  "password": "senha_segura",
  "first_name": "Nome",
  "last_name": "Sobrenome"
}
```

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "usuario@example.com",  // ou username
  "password": "senha"
}

Response:
{
  "refresh": "token_refresh_jwt",
  "access": "token_access_jwt"
}
```

### Verificar Email
```http
POST /api/auth/verify-email/
Content-Type: application/json

{
  "token": "uuid-do-token-recebido-por-email"
}
```

### Solicitar Reset de Senha
```http
POST /api/auth/password-reset/
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

### Confirmar Reset de Senha
```http
POST /api/auth/password-reset/confirm/
Content-Type: application/json

{
  "token": "uuid-do-token-recebido-por-email",
  "password": "nova_senha_segura"
}
```

### Logout
```http
POST /api/auth/logout/
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "refresh": "token_refresh_jwt"
}
```

---

## 📧 CONFIGURAÇÃO DE EMAIL

### Servidor SMTP (Hostinger)
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USE_SSL=True
EMAIL_HOST_USER=contato@basecorporativa.store
EMAIL_HOST_PASSWORD=sua_senha_aqui
DEFAULT_FROM_EMAIL=BASE CORPORATIVA <contato@basecorporativa.store>
```

### Templates de Email
- ✅ `email_verification.html` - Confirmação de cadastro
- ✅ `password_reset.html` - Recuperação de senha

Ambos com design responsivo e cores da marca.

---

## 🔒 SEGURANÇA

### Tokens
- **Email Verification:** UUID v4, 24h validade, uso único
- **Password Reset:** UUID v4, 1h validade, uso único
- **JWT Access:** 5 minutos validade
- **JWT Refresh:** 1 dia validade

### Proteções
- ✅ Senhas hasheadas com PBKDF2
- ✅ Tokens únicos e expiráveis
- ✅ SSL/TLS para emails
- ✅ CORS configurado
- ✅ Não revela se email existe (reset)
- ✅ Blacklist de tokens no logout

---

## 📱 FLUXO DE CADASTRO

1. Usuário preenche formulário → `POST /api/auth/register/`
2. Sistema cria conta e envia email
3. Usuário recebe email com link
4. Usuário clica no link → Redireciona para `/verificar-email/{token}`
5. Frontend chama → `POST /api/auth/verify-email/`
6. Email verificado → Usuário pode fazer login

---

## 🔄 FLUXO DE RECUPERAÇÃO

1. Usuário solicita reset → `POST /api/auth/password-reset/`
2. Sistema envia email com link
3. Usuário recebe email e clica no link
4. Redireciona para `/redefinir-senha/{token}`
5. Usuário define nova senha
6. Frontend envia → `POST /api/auth/password-reset/confirm/`
7. Senha redefinida → Login com nova senha

---

## 🗄️ MODELOS DO BANCO

### User
```python
class User(AbstractUser):
    email_verified = models.BooleanField(default=False)
```

### EmailVerificationToken
```python
class EmailVerificationToken(models.Model):
    user = ForeignKey(User)
    token = UUIDField(unique=True)
    created_at = DateTimeField()
    expires_at = DateTimeField()  # +24h
    used = BooleanField(default=False)
```

### PasswordResetToken
```python
class PasswordResetToken(models.Model):
    user = ForeignKey(User)
    token = UUIDField(unique=True)
    created_at = DateTimeField()
    expires_at = DateTimeField()  # +1h
    used = BooleanField(default=False)
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend ✅
- [x] Modelos User, EmailVerificationToken, PasswordResetToken
- [x] Views de autenticação
- [x] Serializers
- [x] URLs configuradas
- [x] Templates de email
- [x] Configuração SMTP
- [x] JWT configurado

### Frontend ⏳
- [ ] Página de registro
- [ ] Página de login
- [ ] Página `/verificar-email/{token}`
- [ ] Página `/redefinir-senha/{token}`
- [ ] Link "Esqueci minha senha"
- [ ] Mensagem de verificação após registro

---

## 🧪 TESTAR

### 1. Testar Registro
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste",
    "email": "teste@example.com",
    "password": "senha123",
    "first_name": "Teste",
    "last_name": "Usuario"
  }'
```

### 2. Verificar Email Enviado
- Checar logs do Django
- Verificar email recebido

### 3. Testar Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste@example.com",
    "password": "senha123"
  }'
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

**Arquivo:** `backend/AUTHENTICATION_API.md`

Este arquivo contém:
- Todos os endpoints detalhados
- Exemplos de request/response
- Códigos de erro
- Fluxos completos
- Configurações

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Backend implementado
2. ⏳ Criar páginas frontend:
   - Verificação de email
   - Redefinição de senha
3. ⏳ Testar fluxo completo
4. ⏳ Deploy em produção

---

**Status:** ✅ Sistema de autenticação 100% funcional no backend
**Localização:** `backend/users/` (models, views, serializers)
**Documentação:** `backend/AUTHENTICATION_API.md`
