# 📧 Configurar Email da Hostinger com SendGrid

## 🎯 Objetivo

Enviar emails de `contato@basecorporativa.store` (seu domínio Hostinger) através do SendGrid para funcionar no Railway.

**Por que SendGrid?**
- ✅ Railway bloqueia SMTP direto
- ✅ SendGrid usa API HTTP (permitida)
- ✅ Emails saem do SEU domínio
- ✅ Cliente vê `contato@basecorporativa.store`
- ✅ Mantém credibilidade profissional

---

## 📋 Passo a Passo Completo

### Passo 1: Criar Conta SendGrid (5 min)

1. Acesse: https://sendgrid.com/
2. Clique em **"Start for Free"**
3. Preencha:
   - Email: `leonardorfragoso@gmail.com`
   - Senha: (crie uma senha forte)
4. Confirme o email
5. Complete o perfil

**Plano Gratuito:**
- 100 emails/dia = 3.000 emails/mês
- Totalmente gratuito
- Suficiente para começar

### Passo 2: Obter API Key (2 min)

1. Faça login no SendGrid
2. Menu lateral → **Settings** → **API Keys**
3. Clique em **"Create API Key"**
4. Configure:
   - **API Key Name:** `BASE-CORPORATIVA-PRODUCTION`
   - **API Key Permissions:** Selecione **"Restricted Access"**
   - Expanda **"Mail Send"** → Marque **"Mail Send"** como **"Full Access"**
5. Clique em **"Create & View"**
6. **COPIE A API KEY** (você só verá uma vez!)

Exemplo:
```
SG.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### Passo 3: Verificar Email Remetente (10 min)

**IMPORTANTE:** SendGrid precisa verificar que você é dono do email.

#### Opção A: Single Sender Verification (Mais Rápido) ⭐

1. No SendGrid → **Settings** → **Sender Authentication**
2. Clique em **"Verify a Single Sender"**
3. Preencha o formulário:
   ```
   From Name: BASE CORPORATIVA
   From Email Address: contato@basecorporativa.store
   Reply To: contato@basecorporativa.store
   Company Address: Seu endereço comercial
   City: Sua cidade
   Country: Brazil
   ```
4. Clique em **"Create"**
5. SendGrid enviará um email para `contato@basecorporativa.store`
6. **Acesse a caixa de entrada da Hostinger:**
   - Vá no painel da Hostinger
   - Acesse o webmail: https://webmail.hostinger.com
   - Login: `contato@basecorporativa.store`
   - Senha: `Valentina@2308@`
7. Abra o email do SendGrid
8. Clique no link de verificação
9. Pronto! ✅

#### Opção B: Domain Authentication (Recomendado para Produção)

**Vantagens:**
- Todos os emails do domínio são verificados automaticamente
- Melhor reputação de email
- Menos chance de cair em spam

**Como fazer:**

1. No SendGrid → **Settings** → **Sender Authentication**
2. Clique em **"Authenticate Your Domain"**
3. Selecione:
   - **DNS Host:** Other Host (ou Hostinger se disponível)
   - **Domain:** `basecorporativa.store`
4. SendGrid mostrará 3 registros DNS para adicionar:
   ```
   CNAME: em1234.basecorporativa.store → u1234567.wl123.sendgrid.net
   CNAME: s1._domainkey.basecorporativa.store → s1.domainkey.u1234567.wl123.sendgrid.net
   CNAME: s2._domainkey.basecorporativa.store → s2.domainkey.u1234567.wl123.sendgrid.net
   ```

5. **Adicionar registros DNS na Hostinger:**
   - Acesse o painel da Hostinger
   - Vá em **Domínios** → `basecorporativa.store`
   - Clique em **DNS / Nameservers**
   - Para cada registro CNAME:
     - Clique em **"Add Record"**
     - Type: **CNAME**
     - Name: (copie do SendGrid, ex: `em1234`)
     - Points to: (copie do SendGrid, ex: `u1234567.wl123.sendgrid.net`)
     - TTL: 3600
     - Clique em **"Add Record"**

6. Volte no SendGrid e clique em **"Verify"**
7. Aguarde até 48h (geralmente 1-2 horas)

### Passo 4: Configurar Railway (5 min)

1. Acesse: https://railway.app
2. Projeto: `base-corporativa-production`
3. Clique no serviço backend
4. **Settings** → **Variables**
5. Clique em **"RAW Editor"**
6. **Remova ou comente** as variáveis SMTP antigas:
   ```
   # EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   # EMAIL_HOST=smtp.hostinger.com
   # EMAIL_PORT=465
   # EMAIL_USE_SSL=True
   # EMAIL_HOST_USER=contato@basecorporativa.store
   # EMAIL_HOST_PASSWORD=Valentina@2308@
   ```

7. **Adicione** as novas variáveis SendGrid:
   ```
   EMAIL_BACKEND=users.email_backend_sendgrid.SendGridBackend
   SENDGRID_API_KEY=SG.sua_api_key_aqui_colada
   DEFAULT_FROM_EMAIL=BASE CORPORATIVA <contato@basecorporativa.store>
   EMAIL_SYNC_MODE=True
   ```

8. Clique em **"Deploy"** ou aguarde redeploy automático

### Passo 5: Fazer Deploy do Código (2 min)

```bash
git add .
git commit -m "Adicionar SendGrid para envio de emails do domínio Hostinger"
git push
```

Aguarde o deploy completar (~2-3 minutos)

### Passo 6: Testar (5 min)

1. Aguarde deploy completar no Railway
2. Abra os logs: **Deploy Logs**
3. Acesse: https://basecorporativa.store/register
4. Crie uma nova conta com seu email pessoal
5. Observe os logs:
   ```
   ✅ Email enviado via SendGrid de contato@basecorporativa.store para: seu@email.com
   ```
6. Verifique sua caixa de entrada
7. **Veja o remetente:** `BASE CORPORATIVA <contato@basecorporativa.store>` ✅

---

## ✅ Resultado Final

**O que o cliente verá:**
```
De: BASE CORPORATIVA <contato@basecorporativa.store>
Para: cliente@gmail.com
Assunto: Confirme seu cadastro - BASE CORPORATIVA

[Email com seu template HTML]
```

**Vantagens:**
- ✅ Email profissional do seu domínio
- ✅ Funciona no Railway
- ✅ Credibilidade mantida
- ✅ Gratuito até 100 emails/dia
- ✅ Estatísticas de entrega
- ✅ Menos chance de spam

---

## 📊 Monitorar Emails

### Dashboard SendGrid

1. Acesse: https://app.sendgrid.com
2. **Activity** → Ver emails enviados
3. **Stats** → Estatísticas de entrega

### Ver se email foi entregue

1. **Activity Feed**
2. Busque pelo email do destinatário
3. Veja status:
   - ✅ **Delivered** - Email entregue
   - ⏳ **Processed** - Em processamento
   - ❌ **Bounced** - Email inválido
   - 📧 **Opened** - Cliente abriu o email
   - 🔗 **Clicked** - Cliente clicou em link

---

## 🔧 Troubleshooting

### Erro: "The from email does not match a verified Sender Identity"

**Causa:** Email não verificado no SendGrid

**Solução:**
1. Verificar Passo 3
2. Acessar webmail da Hostinger
3. Clicar no link de verificação do SendGrid

### Email não chega

**Verificar:**
1. ✅ API Key está correta no Railway
2. ✅ Sender foi verificado no SendGrid
3. ✅ Deploy foi concluído
4. ✅ Logs mostram "Email enviado"
5. ✅ Verificar pasta de SPAM
6. ✅ Activity Feed no SendGrid

### Email cai no spam

**Soluções:**
1. Fazer Domain Authentication (Passo 3, Opção B)
2. Adicionar SPF e DKIM na Hostinger
3. Aquecer o domínio (enviar poucos emails no início)

---

## 💰 Custos

### SendGrid Gratuito
- **100 emails/dia**
- **3.000 emails/mês**
- **$0/mês**
- Suficiente para começar

### Se precisar mais

**Essentials - $19.95/mês:**
- 50.000 emails/mês
- Suporte por email

**Pro - $89.95/mês:**
- 100.000 emails/mês
- Suporte prioritário

---

## 📝 Checklist Final

- [ ] Criar conta SendGrid
- [ ] Obter API Key
- [ ] Verificar sender `contato@basecorporativa.store`
- [ ] Adicionar variáveis no Railway
- [ ] Fazer deploy do código
- [ ] Testar envio de email
- [ ] Verificar recebimento
- [ ] Confirmar que remetente é `contato@basecorporativa.store`

---

## 🎯 Próximo Passo

**Agora faça:**

1. Criar conta no SendGrid: https://sendgrid.com
2. Seguir os passos acima
3. Me avisar quando tiver a API Key
4. Vou ajudar a configurar no Railway

**Tempo total:** ~30 minutos  
**Custo:** Gratuito  
**Resultado:** Emails profissionais funcionando! ✅
