# Troubleshooting: Botão "Pagar" Desabilitado no Mercado Pago

## 🚨 Problema

O cliente preenche todos os dados do cartão na página do Mercado Pago, mas o botão "Pagar" continua desabilitado (cinza).

## 🔍 Causas Possíveis

### 1. CPF não preenchido na página do Mercado Pago

**Sintoma**: Cartão identificado, mas botão desabilitado

**Solução**: 
- Procure um campo "CPF" ou "Documento" na página do MP
- Preencha: `12345678909` (sem pontos e hífen)
- O botão deve habilitar

### 2. Credenciais de TESTE vs PRODUÇÃO

**Problema**: Você está usando credenciais de PRODUÇÃO no Railway, mas testando com cartões de TESTE.

**Verificar**:
```bash
# No Railway, verifique:
MERCADOPAGO_ACCESS_TOKEN=APP_USR-... # ← PRODUÇÃO
# ou
MERCADOPAGO_ACCESS_TOKEN=TEST-...    # ← TESTE
```

**Solução**:
- Para testar: Use credenciais de TESTE
- Para produção: Use credenciais de PRODUÇÃO + cartões reais

### 3. Conta Mercado Pago não ativada

**Sintoma**: Botão sempre desabilitado, independente dos dados

**Verificar**:
1. Acesse: https://www.mercadopago.com.br/settings/account
2. Confirme que a conta está ativa
3. Verifique se pode receber pagamentos

### 4. Valor muito baixo

**Sintoma**: Mercado Pago rejeita valores muito baixos

**Solução**:
- Teste com valores acima de R$ 5,00
- Alguns métodos têm valor mínimo

## ✅ Soluções Recomendadas

### Solução 1: Use o Checkout Transparente (PIX)

**Vantagens**:
- ✅ Cliente não sai do site
- ✅ QR Code gerado instantaneamente
- ✅ Não depende da página do Mercado Pago
- ✅ Melhor experiência do usuário

**Como usar**:
1. No carrinho, clique em **"Pagar com PIX"** (botão azul)
2. Escaneie o QR Code ou copie o código
3. Pague no app do banco
4. Pronto!

### Solução 2: Preencher CPF na página do MP

Se preferir usar cartão:
1. Preencha todos os dados do cartão
2. **Procure o campo "CPF" ou "Documento"**
3. Digite: `12345678909`
4. Botão "Pagar" deve habilitar

### Solução 3: Usar credenciais de TESTE

Para ambiente de desenvolvimento:

1. No Mercado Pago, obtenha credenciais de TESTE:
   - Acesse: https://www.mercadopago.com.br/developers/panel/credentials
   - Copie as credenciais de **TESTE**

2. No Railway, atualize:
   ```bash
   MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxx
   MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxx
   ```

3. Use cartões de teste:
   - Aprovado: `5031 4332 1540 6351`
   - Rejeitado: `5031 7557 3453 0604`

## 🔧 Melhorias Implementadas

### 1. Binary Mode
```python
"binary_mode": True  # Retorna direto para success/failure
```
- Evita status "pending" desnecessário
- Resposta mais rápida

### 2. Purpose
```python
"purpose": "wallet_purchase"  # Indica e-commerce
```
- Otimiza o checkout para compras online

### 3. CPF na Preferência
```python
"payer": {
    "identification": {
        "type": "CPF",
        "number": "12345678909"
    }
}
```
- Tenta pré-preencher o CPF no MP

## 📊 Comparação: Checkout Pro vs Transparente

| Recurso | Checkout Pro (MP) | Checkout Transparente (PIX) |
|---------|-------------------|------------------------------|
| **Local** | Página do MP | Seu site |
| **Métodos** | PIX, Cartão, Boleto | Apenas PIX |
| **UX** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Problemas** | Botão desabilitado | Nenhum |
| **Setup** | Mais simples | Já implementado |
| **Conversão** | Menor | Maior |

## 🎯 Recomendação Final

### Para TESTE (desenvolvimento):

**Opção A: Checkout Transparente PIX** (Recomendado)
- Mais rápido
- Sem problemas
- Melhor UX

**Opção B: Checkout Pro com credenciais de TESTE**
1. Troque para credenciais TEST no Railway
2. Use cartões de teste
3. Preencha CPF na página do MP

### Para PRODUÇÃO:

**Opção A: Priorizar PIX** (Recomendado)
- Botão principal: "Pagar com PIX"
- Botão secundário: "Cartão, Boleto e Mais"
- Maioria dos brasileiros usa PIX

**Opção B: Implementar Checkout Transparente para Cartão**
- Cliente digita cartão no seu site
- Não sai da página
- Mais complexo de implementar
- Posso implementar se quiser

## 🆘 Debug Avançado

Se o problema persistir:

### 1. Verificar logs do Railway
```bash
# Procure por:
"Criando preferência MP para pedido"
"Preference data: {...}"
"Erro MP:"
```

### 2. Inspecionar Network no navegador
1. Abra DevTools (F12)
2. Aba Network
3. Procure request para `/create-preference/`
4. Verifique se CPF está sendo enviado

### 3. Testar endpoint diretamente
```bash
curl -X POST https://seu-backend.railway.app/api/payments/create-preference/ \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"name": "Teste", "qty": 1, "price": 10}],
    "cpf": "12345678909",
    "email": "teste@teste.com",
    "first_name": "Teste",
    "last_name": "Silva"
  }'
```

## 📝 Próximos Passos

1. ✅ Fazer commit e push das melhorias
2. ✅ Testar com Checkout Transparente (PIX)
3. ⚠️ Se quiser cartão no site, posso implementar
4. ⚠️ Considerar adicionar mais métodos de pagamento
