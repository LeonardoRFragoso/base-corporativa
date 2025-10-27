# API de Autenticação e Verificação de Email

## Configuração do Email

O sistema utiliza o servidor SMTP da Hostinger para envio de emails transacionais.

### Variáveis de Ambiente Necessárias

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USE_SSL=True
EMAIL_HOST_USER=contato@basecorporativa.store
EMAIL_HOST_PASSWORD=sua_senha_aqui
DEFAULT_FROM_EMAIL=BASE CORPORATIVA <contato@basecorporativa.store>
```

## Endpoints da API

### 1. Registro de Usuário
**POST** `/api/auth/register/`

Cria uma nova conta de usuário e envia email de verificação.

**Request Body:**
```json
{
  "username": "usuario123",
  "email": "usuario@example.com",
  "password": "senha_segura",
  "first_name": "Nome",
  "last_name": "Sobrenome"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@example.com",
    "first_name": "Nome",
    "last_name": "Sobrenome"
  },
  "message": "Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta."
}
```

### 2. Verificar Email
**POST** `/api/auth/verify-email/`

Verifica o email do usuário usando o token recebido por email.

**Request Body:**
```json
{
  "token": "uuid-do-token-recebido-por-email"
}
```

**Response (200 OK):**
```json
{
  "detail": "Email verificado com sucesso!"
}
```

**Erros:**
- `400 Bad Request`: Token inválido ou expirado

### 3. Reenviar Email de Verificação
**POST** `/api/auth/resend-verification/`

Reenvia o email de verificação para usuários que não verificaram o email.

**Request Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response (200 OK):**
```json
{
  "detail": "Email de verificação reenviado com sucesso!"
}
```

### 4. Solicitar Reset de Senha
**POST** `/api/auth/password-reset/`

Envia email com link para redefinir senha.

**Request Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response (200 OK):**
```json
{
  "detail": "Se existir uma conta com este email, você receberá instruções para redefinir sua senha."
}
```

### 5. Confirmar Reset de Senha
**POST** `/api/auth/password-reset/confirm/`

Redefine a senha usando o token recebido por email.

**Request Body:**
```json
{
  "token": "uuid-do-token-recebido-por-email",
  "password": "nova_senha_segura"
}
```

**Response (200 OK):**
```json
{
  "detail": "Senha redefinida com sucesso!"
}
```

**Erros:**
- `400 Bad Request`: Token inválido ou expirado

### 6. Login
**POST** `/api/auth/login/`

Autentica usuário e retorna tokens JWT. Aceita email ou username.

**Request Body:**
```json
{
  "username": "usuario@example.com",
  "password": "senha"
}
```

**Response (200 OK):**
```json
{
  "refresh": "token_refresh_jwt",
  "access": "token_access_jwt"
}
```

### 7. Logout
**POST** `/api/auth/logout/`

Invalida o refresh token.

**Request Body:**
```json
{
  "refresh": "token_refresh_jwt"
}
```

**Response (200 OK):**
```json
{
  "detail": "logout efetuado"
}
```

## Fluxo de Cadastro

1. **Usuário se registra** → POST `/api/auth/register/`
2. **Sistema envia email** com link de verificação
3. **Usuário clica no link** → Redireciona para frontend `/verificar-email/{token}`
4. **Frontend chama API** → POST `/api/auth/verify-email/` com o token
5. **Email verificado** → Usuário pode fazer login normalmente

## Fluxo de Recuperação de Senha

1. **Usuário solicita reset** → POST `/api/auth/password-reset/`
2. **Sistema envia email** com link de reset
3. **Usuário clica no link** → Redireciona para frontend `/redefinir-senha/{token}`
4. **Frontend exibe formulário** de nova senha
5. **Frontend envia nova senha** → POST `/api/auth/password-reset/confirm/`
6. **Senha redefinida** → Usuário pode fazer login com nova senha

## Tokens

### Email Verification Token
- **Validade:** 24 horas
- **Uso único:** Sim
- **Formato:** UUID v4

### Password Reset Token
- **Validade:** 1 hora
- **Uso único:** Sim
- **Formato:** UUID v4

## Modelos

### User
```python
class User(AbstractUser):
    email_verified = models.BooleanField(default=False)
```

### EmailVerificationToken
```python
class EmailVerificationToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # +24 horas
    used = models.BooleanField(default=False)
```

### PasswordResetToken
```python
class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # +1 hora
    used = models.BooleanField(default=False)
```

## Templates de Email

Os emails são enviados em formato HTML responsivo com o tema da BASE CORPORATIVA:

- **email_verification.html**: Email de confirmação de cadastro
- **password_reset.html**: Email de recuperação de senha

Ambos incluem:
- Design responsivo
- Cores da marca (dourado/bronze)
- Botões de ação destacados
- Links alternativos para copiar/colar
- Avisos de expiração
- Rodapé com informações da empresa

## Segurança

- Senhas são hasheadas com PBKDF2
- Tokens são UUID v4 únicos
- Tokens expiram automaticamente
- Tokens são de uso único
- Não revela se email existe no sistema (para reset de senha)
- SSL/TLS para envio de emails
- CORS configurado para frontend específico

## Próximos Passos

1. **Configurar senha do email** nos arquivos `.env` e `.env.railway`
2. **Criar páginas no frontend:**
   - `/verificar-email/{token}` - Página de verificação de email
   - `/redefinir-senha/{token}` - Página de redefinição de senha
3. **Atualizar página de registro** para mostrar mensagem sobre verificação de email
4. **Adicionar link "Esqueci minha senha"** na página de login
5. **Testar fluxo completo** em desenvolvimento
6. **Deploy no Railway** com variáveis de ambiente configuradas
