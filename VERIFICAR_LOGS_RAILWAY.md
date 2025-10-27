# 🔍 Como Verificar Logs no Railway

## Problema Atual
- Cadastro funciona ✅
- Mensagem aparece ✅
- Email NÃO chega ❌

## Passos para Verificar

### 1. Acessar Logs do Railway

1. Acesse: https://railway.app
2. Entre no projeto: `base-corporativa-production`
3. Clique no serviço do backend (Django)
4. Clique na aba **"Deployments"**
5. Clique no deployment mais recente
6. Clique em **"View Logs"**

### 2. O que procurar nos logs

Após criar uma conta, procure por:

**✅ Sucesso:**
```
✅ Email de verificação enviado para: genival.zirar@gmail.com
```

**❌ Erro:**
```
❌ Erro ao enviar email de verificação para genival.zirar@gmail.com: [detalhes]
Traceback (most recent call last):
  ...
```

### 3. Possíveis Erros

#### Erro 1: Variáveis de ambiente não configuradas
```
KeyError: 'EMAIL_HOST'
```
**Solução:** Adicionar variáveis no Railway

#### Erro 2: Autenticação SMTP falhou
```
SMTPAuthenticationError: (535, b'5.7.8 Error: authentication failed')
```
**Solução:** Verificar senha do email

#### Erro 3: Conexão recusada
```
ConnectionRefusedError: [Errno 111] Connection refused
```
**Solução:** Verificar porta e SSL

#### Erro 4: Timeout
```
TimeoutError: [Errno 110] Connection timed out
```
**Solução:** Firewall do Railway pode estar bloqueando

## Comandos Úteis

### Ver logs em tempo real (CLI)
```bash
railway logs --follow
```

### Ver últimas 100 linhas
```bash
railway logs --lines 100
```

## Checklist de Variáveis no Railway

Verifique se TODAS essas variáveis estão configuradas:

- [ ] `EMAIL_BACKEND` = `django.core.mail.backends.smtp.EmailBackend`
- [ ] `EMAIL_HOST` = `smtp.hostinger.com`
- [ ] `EMAIL_PORT` = `465`
- [ ] `EMAIL_USE_SSL` = `True`
- [ ] `EMAIL_HOST_USER` = `contato@basecorporativa.store`
- [ ] `EMAIL_HOST_PASSWORD` = `Valentina@2308@`
- [ ] `DEFAULT_FROM_EMAIL` = `BASE CORPORATIVA <contato@basecorporativa.store>`

## Teste Rápido

Após verificar os logs, teste novamente:

1. Criar nova conta com email diferente
2. Observar logs em tempo real
3. Verificar se aparece mensagem de sucesso ou erro
4. Verificar caixa de entrada E spam

## Se o erro persistir

### Opção 1: Usar console do Django no Railway

```bash
railway run python manage.py shell
```

```python
from django.core.mail import send_mail
from django.conf import settings

# Testar envio direto
send_mail(
    'Teste Railway',
    'Email de teste do Railway',
    settings.DEFAULT_FROM_EMAIL,
    ['genival.zirar@gmail.com'],
    fail_silently=False,
)
```

### Opção 2: Adicionar logging mais detalhado

Adicionar no `settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.core.mail': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Contato Hostinger

Se o problema for com o servidor SMTP:

1. Acessar painel da Hostinger
2. Verificar:
   - Limite de envio de emails
   - Status do servidor SMTP
   - Logs de tentativas de envio
   - Bloqueios de segurança

## Alternativa Temporária

Se o SMTP da Hostinger não funcionar no Railway, considerar:

1. **SendGrid** (100 emails/dia grátis)
2. **Mailgun** (5000 emails/mês grátis)
3. **AWS SES** (62.000 emails/mês grátis)

---

**Próximo passo:** Verificar logs do Railway e reportar o erro encontrado
