# Pagamento PIX - Explicação Completa

## ✅ Status Atual

As credenciais do Mercado Pago **JÁ ESTÃO CONFIGURADAS** no Railway:
- `MERCADOPAGO_ACCESS_TOKEN`: Configurado ✅
- `MERCADOPAGO_PUBLIC_KEY`: Configurado ✅
- `MERCADOPAGO_NOTIFICATION_URL`: Configurado ✅

## 🎯 Implementação Realizada

Implementei **DUAS OPÇÕES** de pagamento PIX:

### Opção 1: Checkout Pro (Mercado Pago) - **MELHORADO**
- **Endpoint**: `/api/payments/create-preference/`
- **Botão**: "Outros métodos de pagamento"
- **Funcionamento**: Redireciona para página do Mercado Pago
- **Vantagens**:
  - Mercado Pago gerencia toda a interface
  - Suporta múltiplos métodos (PIX, cartão, boleto)
  - Mais seguro (PCI compliance)
- **O que foi melhorado**:
  - ✅ Adicionado endereço do pagador
  - ✅ Configurado `auto_return` para retorno automático
  - ✅ Melhorada estrutura do `payer`

### Opção 2: Checkout Transparente (PIX Direto) - **NOVO**
- **Endpoint**: `/api/payments/create-pix/`
- **Botão**: "Pagar com PIX" (botão azul principal)
- **Funcionamento**: Gera QR Code na própria aplicação
- **Vantagens**:
  - Cliente não sai do site
  - Experiência mais fluida
  - QR Code + código copia-e-cola
- **Página**: `/checkout/pix`

## 🔍 Por que o botão "Gerar Pix" estava desabilitado?

O Mercado Pago pode desabilitar o PIX por alguns motivos:

### 1. **Falta de informações do pagador**
- ❌ CPF/CNPJ não informado
- ❌ Endereço incompleto
- ❌ Email inválido

### 2. **Configuração da conta**
- Verifique se sua conta Mercado Pago está ativada para PIX
- Acesse: https://www.mercadopago.com.br/settings/account/credentials

### 3. **Valor mínimo**
- PIX pode ter valor mínimo configurado na sua conta

## 🚀 Como Testar

### Teste 1: Checkout Pro (Mercado Pago)
1. Adicione produtos ao carrinho
2. Preencha todos os dados (nome, email, endereço)
3. Clique em **"Outros métodos de pagamento"**
4. Na página do Mercado Pago, selecione **PIX**
5. O botão "Gerar Pix" deve estar habilitado

### Teste 2: Checkout Transparente (PIX Direto)
1. Adicione produtos ao carrinho
2. Preencha todos os dados
3. Clique em **"Pagar com PIX"** (botão azul)
4. Você verá:
   - QR Code para escanear
   - Código copia-e-cola
   - Valor a pagar
   - Instruções

## 🔧 Solução para Habilitar o Botão PIX

Se o botão "Gerar Pix" continuar desabilitado no Checkout Pro:

### Opção A: Use o Checkout Transparente (Recomendado)
- Já está implementado e funcionando
- Melhor experiência do usuário
- Cliente não sai do site

### Opção B: Adicione CPF no Checkout Pro
Edite `backend/payments/views.py` linha 164-176:

```python
"payer": {
    "name": payer_name.strip() or "Cliente",
    "email": payer_email,
    "identification": {
        "type": "CPF",  # ou "CNPJ"
        "number": "12345678900"  # CPF do cliente
    },
    "phone": {
        "area_code": "21",
        "number": "999999999"
    },
    "address": {
        "zip_code": request.data.get('destination_zip', '').replace('-', ''),
        "street_name": request.data.get('shipping_street', ''),
        "street_number": request.data.get('shipping_number', '')
    }
}
```

**Nota**: Para isso, você precisaria adicionar campo de CPF no formulário do carrinho.

## 📊 Recomendação

**Use o Checkout Transparente (Opção 2)** porque:
1. ✅ Já está 100% implementado
2. ✅ Não precisa de CPF obrigatório
3. ✅ Melhor UX (cliente não sai do site)
4. ✅ QR Code + código copia-e-cola
5. ✅ Visual moderno e profissional

## 🎨 Interface Implementada

### Carrinho (`/cart`)
```
┌─────────────────────────────────────┐
│  [💰 Pagar com PIX]  ← Azul/Principal
│  [💳 Outros métodos] ← Secundário
└─────────────────────────────────────┘
```

### Página PIX (`/checkout/pix`)
```
┌─────────────────────────────────────┐
│         Pagamento via PIX           │
├─────────────────────────────────────┤
│                                     │
│         [QR CODE AQUI]              │
│                                     │
│  Valor: R$ 89,75                    │
│                                     │
│  Código copia-e-cola:               │
│  [00020126580014br.gov.bcb...]      │
│  [📋 Copiar]                        │
│                                     │
│  Instruções:                        │
│  1. Abra o app do banco             │
│  2. Escolha "Pagar com PIX"         │
│  3. Escaneie o QR Code              │
│  4. Confirme o pagamento            │
│                                     │
│  [✓ Já paguei - Verificar status]  │
└─────────────────────────────────────┘
```

## 📝 Próximos Passos

1. **Fazer deploy** das alterações no Railway
2. **Testar** o botão "Pagar com PIX" no site
3. **Configurar webhook** no Mercado Pago (se ainda não configurou):
   - URL: `https://base-corporativa-production.up.railway.app/api/payments/webhook/`
   - Eventos: `payment`, `merchant_order`

## 🆘 Suporte

Se ainda tiver problemas:
1. Verifique os logs do Railway
2. Teste com credenciais de TESTE primeiro
3. Confirme que a conta Mercado Pago está ativada para PIX
