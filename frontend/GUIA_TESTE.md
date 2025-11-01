# 🧪 Guia de Teste - Melhorias Frontend

## 🚀 Como Testar as Novas Funcionalidades

### 1️⃣ Instalação e Inicialização

```bash
cd frontend
npm install
npm run dev
```

### 2️⃣ Funcionalidades do Cliente

#### **Busca de Produtos**
1. Clique no ícone de lupa 🔍 no Navbar
2. Digite o nome de um produto
3. Veja os resultados em tempo real
4. Clique em "Ver todos os resultados"

#### **Filtros Avançados no Catálogo**
1. Acesse `/catalog`
2. Clique em "Filtros"
3. Teste:
   - Filtro por categoria
   - Faixa de preço (mín/máx)
   - Apenas em estoque
   - Ordenação (preço, nome, data)
4. Observe a URL sendo atualizada
5. Compartilhe a URL com filtros

#### **Comparação de Produtos**
1. No catálogo, passe o mouse sobre um produto
2. Clique no ícone de comparação (GitCompare)
3. Adicione até 4 produtos
4. Veja o contador no Navbar
5. Clique no ícone de comparação no Navbar
6. Compare características lado a lado

#### **Tema Escuro**
1. Clique no ícone de lua 🌙 no Navbar
2. Veja o tema mudar
3. Recarregue a página (preferência é salva)
4. Clique no sol ☀️ para voltar ao tema claro

#### **Chat de Suporte**
1. Veja o botão flutuante no canto inferior direito
2. Clique para abrir o chat
3. Teste as respostas rápidas
4. Digite uma mensagem personalizada
5. Veja as respostas automáticas

#### **PWA (Progressive Web App)**
1. Build do projeto: `npm run build`
2. Sirva com HTTPS ou localhost
3. No Chrome, veja o ícone de instalação
4. Instale o app
5. Use offline (cache básico)

### 3️⃣ Funcionalidades Admin

#### **Dashboard Melhorado**
1. Faça login como admin
2. Acesse `/admin/dashboard`
3. Veja:
   - Cards de estatísticas com trends
   - Gráfico de vendas interativo (Chart.js)
   - Produtos mais vendidos
   - Alertas de estoque
   - Pedidos recentes
4. Teste:
   - Mudar período de análise (7, 30, 90 dias)
   - Botão "Atualizar"
   - Botão "Exportar"
   - Clique nos cards para navegar

#### **Bulk Actions (Ações em Massa)**
1. Acesse `/admin/orders` ou `/admin/products`
2. Selecione múltiplos itens (checkbox)
3. Veja a barra de ações aparecer na parte inferior
4. Escolha uma ação (deletar, arquivar, etc)
5. Confirme a ação

#### **Exportação de Dados**
1. Em qualquer lista admin (pedidos, produtos, clientes)
2. Clique em "Exportar"
3. Escolha formato (CSV ou JSON)
4. Arquivo será baixado automaticamente

#### **Filtros Avançados Admin**
1. Acesse `/admin/orders`
2. Use filtros:
   - Status do pedido
   - Data (intervalo)
   - Valor mínimo/máximo
   - Método de pagamento
3. Combine múltiplos filtros

### 4️⃣ Testes de Acessibilidade

#### **Navegação por Teclado**
1. Use apenas o teclado (Tab, Enter, Esc)
2. Navegue pelos menus
3. Abra modais e feche com Esc
4. Teste formulários

#### **Leitores de Tela**
1. Ative um leitor de tela (NVDA, JAWS, VoiceOver)
2. Navegue pelo site
3. Verifique se todos os elementos são anunciados
4. Teste labels e descrições

#### **Breadcrumbs**
1. Navegue por diferentes páginas
2. Veja o caminho de navegação no topo
3. Clique para voltar a páginas anteriores

### 5️⃣ Testes de Performance

#### **Lazy Loading de Imagens**
1. Abra o DevTools (F12)
2. Vá para Network > Img
3. Role a página lentamente
4. Veja imagens sendo carregadas sob demanda

#### **Skeleton Loaders**
1. Simule conexão lenta (DevTools > Network > Slow 3G)
2. Navegue pelo site
3. Veja placeholders animados durante carregamento

#### **Toast Notifications**
1. Execute qualquer ação (adicionar ao carrinho, salvar, etc)
2. Veja notificação aparecer no topo direito
3. Teste diferentes tipos:
   - Sucesso (verde)
   - Erro (vermelho)
   - Loading (amarelo)

### 6️⃣ Testes Mobile

1. Abra DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Teste em diferentes dispositivos:
   - iPhone SE
   - iPhone 12 Pro
   - iPad
   - Galaxy S20
4. Verifique:
   - Menu mobile
   - Filtros responsivos
   - Cards de produtos
   - Formulários

### 7️⃣ Checklist de Funcionalidades

- [ ] Busca de produtos funciona
- [ ] Filtros avançados aplicam corretamente
- [ ] Comparação de produtos (máx 4)
- [ ] Tema escuro persiste após reload
- [ ] Chat de suporte responde
- [ ] PWA pode ser instalado
- [ ] Dashboard mostra gráficos
- [ ] Bulk actions funcionam
- [ ] Exportação gera arquivos
- [ ] Breadcrumbs navegam corretamente
- [ ] Toast notifications aparecem
- [ ] Skeleton loaders durante carregamento
- [ ] Lazy loading de imagens
- [ ] Navegação por teclado funciona
- [ ] Mobile responsivo

## 🐛 Problemas Comuns

### Service Worker não registra
```bash
# Solução: Build e sirva em HTTPS
npm run build
npx serve -s dist
```

### Tema escuro não funciona
```bash
# Verifique se darkMode está no tailwind.config.js
# Deve ter: darkMode: 'class'
```

### Gráficos não aparecem
```bash
# Reinstale dependências
npm install chart.js react-chartjs-2
```

### Toast não aparece
```bash
# Verifique se Toast está no App.jsx
# Deve ter: <Toast /> dentro do JSX
```

## 📊 Métricas de Sucesso

- **Tempo de carregamento**: < 3s
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90
- **Acessibilidade Score**: > 90

## 🎯 Próximos Testes

1. Teste de carga (muitos produtos)
2. Teste de stress (muitas requisições)
3. Teste de compatibilidade (navegadores antigos)
4. Teste de segurança (XSS, CSRF)
5. Teste de usabilidade (usuários reais)

---

**Boa sorte com os testes! 🚀**
