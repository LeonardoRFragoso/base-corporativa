# 📋 Próximos Passos - Debug de Email

## ✅ O que foi feito

1. **Logging detalhado adicionado** em `settings.py`
2. **Logging nas funções assíncronas** em `tasks.py`
3. **Timeout de 30s** para conexões SMTP
4. **Documento de troubleshooting** criado

## 🚀 Deploy e Teste

### 1. Fazer commit e push

```bash
git add .
git commit -m "Adicionar logging detalhado para debug de emails"
git push
```

### 2. Aguardar deploy no Railway

- Acesse: https://railway.app
- Projeto: `base-corporativa-production`
- Aguarde o deploy completar (~2-3 minutos)

### 3. Verificar variáveis de ambiente no Railway

**IMPORTANTE:** Verifique se TODAS essas variáveis estão configuradas:

```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USE_SSL=True
EMAIL_HOST_USER=contato@basecorporativa.store
EMAIL_HOST_PASSWORD=Valentina@2308@
DEFAULT_FROM_EMAIL=BASE CORPORATIVA <contato@basecorporativa.store>
```

### 4. Testar cadastro e observar logs

1. Abrir logs do Railway em tempo real
2. Criar nova conta no site
3. Observar os logs

**O que você deve ver:**

```
INFO users 🚀 Thread de envio de email iniciada para: genival.zirar@gmail.com
INFO users 🔄 Iniciando envio de email de verificação para: genival.zirar@gmail.com
DEBUG django.core.mail Connecting to smtp.hostinger.com:465
DEBUG django.core.mail Connected to smtp.hostinger.com:465
DEBUG django.core.mail Authenticating...
DEBUG django.core.mail Authentication successful
DEBUG django.core.mail Sending email to ['genival.zirar@gmail.com']
DEBUG django.core.mail Email sent successfully
INFO users ✅ Email de verificação enviado com sucesso para: genival.zirar@gmail.com
```

**Se houver erro, você verá:**

```
ERROR users ❌ Erro ao enviar email de verificação para genival.zirar@gmail.com: [detalhes do erro]
Traceback (most recent call last):
  ...
```

## 🔍 Possíveis Problemas e Soluções

### Problema 1: Variáveis não configuradas

**Sintoma:**
```
KeyError: 'EMAIL_HOST_USER'
```

**Solução:**
1. Ir em Railway → Settings → Variables
2. Adicionar todas as variáveis de email
3. Fazer redeploy

### Problema 2: Autenticação falhou

**Sintoma:**
```
SMTPAuthenticationError: (535, b'5.7.8 Error: authentication failed')
```

**Solução:**
1. Verificar se a senha está correta
2. Verificar no painel da Hostinger se o email está ativo
3. Verificar se há restrições de IP

### Problema 3: Conexão recusada/timeout

**Sintoma:**
```
ConnectionRefusedError
TimeoutError
```

**Solução:**
1. Railway pode estar bloqueando porta 465
2. Tentar usar porta 587 com TLS:
   ```
   EMAIL_PORT=587
   EMAIL_USE_SSL=False
   EMAIL_USE_TLS=True
   ```

### Problema 4: Thread não executa

**Sintoma:**
```
INFO users 🚀 Thread de envio de email iniciada
# Mas não aparece "🔄 Iniciando envio"
```

**Solução:**
- Threads daemon podem ser terminadas antes de completar
- Considerar usar Celery ou Django-Q para produção

## 📊 Comandos Úteis

### Ver logs em tempo real
```bash
railway logs --follow
```

### Testar email direto no Railway
```bash
railway run python manage.py shell
```

```python
from django.core.mail import send_mail
send_mail(
    'Teste',
    'Mensagem de teste',
    'contato@basecorporativa.store',
    ['genival.zirar@gmail.com'],
    fail_silently=False
)
```

## 🎯 Checklist Final

- [ ] Commit e push feitos
- [ ] Deploy completado no Railway
- [ ] Variáveis de ambiente verificadas
- [ ] Logs abertos em tempo real
- [ ] Teste de cadastro realizado
- [ ] Logs analisados
- [ ] Email recebido (ou erro identificado)

## 📞 Se Nada Funcionar

### Alternativa 1: Usar SendGrid (Recomendado)

1. Criar conta grátis: https://sendgrid.com
2. Obter API Key
3. Instalar: `pip install sendgrid`
4. Configurar:
   ```python
   EMAIL_BACKEND = 'sendgrid_backend.SendgridBackend'
   SENDGRID_API_KEY = 'sua_api_key'
   ```

### Alternativa 2: Usar Gmail SMTP

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=senha_de_app
```

### Alternativa 3: Usar Mailgun

1. Criar conta: https://mailgun.com
2. Configurar domínio
3. Usar SMTP ou API

---

**Status Atual:** Aguardando deploy e análise de logs  
**Próxima Ação:** Fazer commit, push e observar logs do Railway
