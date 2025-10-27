# 🚀 Deploy SendGrid - Checklist Final

## ✅ O que já foi feito:

1. ✅ Conta SendGrid criada
2. ✅ Domain Authentication configurada
3. ✅ Registros DNS adicionados na Hostinger
4. ✅ API Key obtida
5. ✅ Código atualizado com backend SendGrid
6. ✅ Arquivos .env atualizados

---

## 📋 Próximos Passos:

### 1. Fazer commit e push

```bash
git add .
git commit -m "Adicionar SendGrid para envio de emails"
git push
```

### 2. Atualizar variáveis no Railway

Acesse: https://railway.app

1. Projeto: `base-corporativa-production`
2. Clique no serviço backend
3. **Settings** → **Variables**
4. Clique em **"RAW Editor"**
5. **Remova ou comente** as linhas antigas de SMTP:
   ```
   # EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   # EMAIL_HOST=smtp.hostinger.com
   # EMAIL_PORT=465
   # EMAIL_USE_SSL=True
   # EMAIL_HOST_USER=contato@basecorporativa.store
   # EMAIL_HOST_PASSWORD=Valentina@2308@
   # EMAIL_SYNC_MODE=True
   ```

6. **Adicione** as novas variáveis SendGrid:
   ```
   EMAIL_BACKEND=users.email_backend_sendgrid.SendGridBackend
   SENDGRID_API_KEY=SG.sua_api_key_sendgrid_aqui
   DEFAULT_FROM_EMAIL=BASE CORPORATIVA <contato@basecorporativa.store>
   ```

7. Salvar (Railway vai fazer redeploy automático)

### 3. Aguardar deploy (~2-3 min)

### 4. Verificar DNS no SendGrid

Enquanto aguarda o deploy:

1. Volte na aba do SendGrid
2. Na página de Domain Authentication
3. Clique em **"Verify"** ou **"Verificar"**
4. Se os registros DNS propagaram, vai aparecer verde ✅

### 5. Testar envio de email

Depois do deploy:

1. Abra os logs do Railway: **Deploy Logs**
2. Acesse: https://basecorporativa.store/register
3. Crie uma nova conta com seu email
4. Observe os logs:
   ```
   ✅ Email enviado via SendGrid de contato@basecorporativa.store
   ```
5. Verifique sua caixa de entrada
6. **Remetente deve ser:** `BASE CORPORATIVA <contato@basecorporativa.store>`

---

## 🎯 Resultado Esperado

**Logs do Railway:**
```
📧 Enviando email de verificação para: usuario@email.com
🔄 Iniciando envio SÍNCRONO de email de verificação
INFO users ✅ Email enviado via SendGrid de contato@basecorporativa.store para: ['usuario@email.com']
```

**Email recebido:**
```
De: BASE CORPORATIVA <contato@basecorporativa.store>
Para: usuario@email.com
Assunto: Confirme seu cadastro - BASE CORPORATIVA
```

---

## 🔧 Troubleshooting

### Se der erro "The from email does not match a verified Sender Identity"

**Causa:** Domain Authentication ainda não foi verificado

**Solução:**
1. Aguardar mais tempo (até 48h)
2. Verificar se os registros DNS estão corretos na Hostinger
3. Clicar em "Verify" no SendGrid novamente

### Se der erro "API key not valid"

**Causa:** API Key incorreta ou expirada

**Solução:**
1. Verificar se copiou a API Key completa
2. Verificar se não tem espaços extras
3. Gerar nova API Key se necessário

### Email não chega

**Verificar:**
1. ✅ Logs do Railway mostram "Email enviado"
2. ✅ Activity Feed no SendGrid mostra email enviado
3. ✅ Verificar pasta de SPAM
4. ✅ Domain Authentication verificado (verde no SendGrid)

---

## 📊 Monitoramento

### SendGrid Dashboard

1. Acesse: https://app.sendgrid.com
2. **Activity** → Ver emails enviados em tempo real
3. **Stats** → Estatísticas de entrega
4. **Suppressions** → Emails bloqueados/bounced

### Limites do Plano Gratuito

- 100 emails/dia
- 3.000 emails/mês
- Suficiente para começar

---

## ✅ Checklist Final

- [ ] Commit e push feitos
- [ ] Variáveis atualizadas no Railway
- [ ] Deploy completado
- [ ] DNS verificado no SendGrid (verde)
- [ ] Teste de cadastro realizado
- [ ] Email recebido com remetente correto
- [ ] Logs confirmam envio via SendGrid

---

**Status:** Pronto para deploy  
**Próxima ação:** Fazer commit e push
