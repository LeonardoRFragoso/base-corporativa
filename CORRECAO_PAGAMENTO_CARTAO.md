# Correção: Cliente não consegue finalizar pagamento com cartão

## 🔍 Problema Identificado

O cliente estava chegando na página do Mercado Pago mas não conseguia finalizar o pagamento com cartão de crédito.

### Causa Raiz

O backend estava enviando campos **vazios** no objeto `payer` da preferência:

```python
"payer": {
    "name": "Cliente",
    "email": "email@example.com",
    "phone": {
        "area_code": "",  # ❌ VAZIO
        "number": ""      # ❌ VAZIO
    },
    "address": {
        "zip_code": "",         # ❌ VAZIO
        "street_name": "",      # ❌ VAZIO
        "street_number": ""     # ❌ VAZIO
    }
}
```

**Resultado**: O Mercado Pago rejeitava a preferência ou não conseguia processar o pagamento corretamente.

## ✅ Solução Implementada

### 1. Remover campos vazios
Agora o backend **só envia campos que têm dados**:

```python
# Montar objeto payer apenas com campos preenchidos
payer_data = {
    "name": payer_name.strip() or "Cliente",
    "email": payer_email
}

# Adicionar telefone APENAS se tiver dados
phone_number = request.data.get('shipping_phone', '')
if phone_number:
    phone_clean = ''.join(filter(str.isdigit, phone_number))
    if len(phone_clean) >= 10:
        payer_data["phone"] = {
            "area_code": phone_clean[:2],
            "number": phone_clean[2:]
        }

# Adicionar endereço APENAS se tiver CEP válido
zip_code = request.data.get('destination_zip', '').replace('-', '')
if zip_code and len(zip_code) == 8:
    payer_data["address"] = {
        "zip_code": zip_code
    }
```

### 2. Validação de dados
- ✅ Telefone: Extrai apenas números e valida mínimo 10 dígitos
- ✅ CEP: Remove hífen e valida 8 dígitos
- ✅ Campos opcionais: Só adiciona se existirem

### 3. Logging melhorado
Adicionado logs para facilitar debug:
- Info ao criar preferência
- Debug dos dados enviados
- Error com detalhes do Mercado Pago

## 🚀 Como Testar

### Teste 1: Pagamento com Cartão (Checkout Pro)
1. Adicione produtos ao carrinho
2. Preencha **todos os dados obrigatórios**:
   - ✅ Nome e sobrenome
   - ✅ Email
   - ✅ Endereço completo
   - ✅ CEP (8 dígitos)
3. Clique em **"Cartão, Boleto e Mais"**
4. Na página do Mercado Pago:
   - Selecione **Cartão de Crédito**
   - Digite os dados do cartão
   - Escolha parcelamento
   - Clique em **Pagar**
5. Deve processar com sucesso ✅

### Teste 2: Dados de Teste do Mercado Pago

Use estes cartões de teste:

**Cartão Aprovado:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: Qualquer data futura
- Nome: Qualquer nome
- CPF: `12345678909`

**Cartão Rejeitado (para testar erro):**
- Número: `5031 7557 3453 0604`

## 📊 Mudanças no Código

### Arquivo: `backend/payments/views.py`

**Antes:**
```python
"payer": {
    "name": payer_name,
    "email": payer_email,
    "phone": {"area_code": "", "number": ""},  # ❌
    "address": {"zip_code": "", ...}            # ❌
}
```

**Depois:**
```python
payer_data = {"name": payer_name, "email": payer_email}
# Só adiciona phone se tiver dados ✅
if phone_number and len(phone_clean) >= 10:
    payer_data["phone"] = {...}
# Só adiciona address se tiver CEP válido ✅
if zip_code and len(zip_code) == 8:
    payer_data["address"] = {...}
```

## 🔧 Verificar Logs no Railway

Se ainda houver problemas, verifique os logs:

1. Acesse: https://railway.app/
2. Selecione o projeto
3. Vá em **Deployments** → **View Logs**
4. Procure por:
   - `Criando preferência MP para pedido`
   - `Erro ao criar preferência MP`
   - `Erro MP:`

## ⚠️ Possíveis Problemas Restantes

Se o erro persistir, pode ser:

### 1. Conta Mercado Pago não ativada
- Verifique se a conta está ativada para receber pagamentos
- Acesse: https://www.mercadopago.com.br/settings/account

### 2. Credenciais incorretas
- Confirme que está usando credenciais de **PRODUÇÃO** (não TEST)
- Verifique no Railway: `MERCADOPAGO_ACCESS_TOKEN`

### 3. Valor mínimo
- Mercado Pago pode ter valor mínimo configurado
- Teste com valores acima de R$ 5,00

### 4. Limite de parcelamento
- Verifique se sua conta permite 12x
- Pode precisar ativar no painel do MP

## 📝 Próximos Passos

1. ✅ Fazer commit e push das alterações
2. ✅ Aguardar deploy no Railway (automático)
3. ✅ Testar pagamento com cartão
4. ✅ Verificar logs se houver erro
5. ✅ Confirmar webhook está configurado

## 🆘 Suporte

Se o problema persistir após essas correções:
1. Copie os logs do Railway
2. Verifique a resposta da API no Network do navegador
3. Confirme que os dados do formulário estão sendo enviados corretamente
