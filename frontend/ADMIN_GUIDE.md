# Guia de Administração - BASE CORPORATIVA

## Acesso Administrativo

### Como identificar um usuário admin
Usuários com privilégios de administrador possuem:
- Badge **ADMIN** visível no navbar ao lado do nome
- Acesso a funcionalidades de gerenciamento de produtos
- Campo `is_staff=true` no perfil do usuário

### Usuário Admin Padrão
- **Email**: leonardorfragoso@gmail.com
- **Status**: Administrador (is_staff=true)

## Gerenciamento de Produtos

### Acessar o Painel de Produtos
1. Faça login com uma conta de administrador
2. Navegue até **Catálogo** no menu principal
3. Você verá o botão **"Novo Produto"** no canto superior direito

### Criar Novo Produto

#### 1. Clique em "Novo Produto"
Um modal será aberto com o formulário de criação.

#### 2. Preencha as Informações Básicas
- **Nome do Produto*** (obrigatório)
  - Ex: "Camiseta Oversized Preta"
  
- **Descrição** (opcional)
  - Descrição detalhada do produto
  
- **Preço Base*** (obrigatório)
  - Valor em reais (R$)
  - Ex: 79.90
  
- **Categoria*** (obrigatória)
  - Selecione uma categoria existente
  - Ex: Camisetas
  
- **Tipo de Tecido** (opcional)
  - Ex: "Algodão Premium", "95% Algodão, 5% Elastano"
  
- **Produto ativo** (checkbox)
  - Marcado: Produto visível no catálogo
  - Desmarcado: Produto oculto (rascunho)

#### 3. Adicionar Variantes
Variantes representam diferentes tamanhos, cores e estoques do produto.

**Para cada variante:**
- **Tamanho**: P, M, G, GG, XL, etc.
- **Cor**: Preto, Branco, Cinza, etc.
- **Preço** (opcional): Se diferente do preço base
- **Estoque**: Quantidade disponível

**Exemplo de Variantes:**
```
Tamanho: P  | Cor: Preto | Preço: (vazio) | Estoque: 10
Tamanho: M  | Cor: Preto | Preço: (vazio) | Estoque: 15
Tamanho: G  | Cor: Preto | Preço: (vazio) | Estoque: 12
Tamanho: GG | Cor: Preto | Preço: (vazio) | Estoque: 8
```

**Botões:**
- **Adicionar Variante**: Adiciona uma nova linha de variante
- **Ícone de Lixeira**: Remove a variante

#### 4. Adicionar Imagens do Produto

**Upload de Imagens:**
- Clique na área de upload ou arraste imagens
- Formatos aceitos: JPG, PNG, WEBP
- Tamanho máximo: 5MB por imagem
- Múltiplas imagens podem ser adicionadas

**Preview das Imagens:**
- Todas as imagens selecionadas aparecerão em miniatura
- A primeira imagem será marcada como "Principal"
- Hover sobre a imagem para ver botão de remover (X)
- Imagens existentes são marcadas com badge "Existente"

**Ordem das Imagens:**
- A primeira imagem é sempre a principal (aparece nos cards)
- Ordem de upload = ordem de exibição

#### 5. Salvar o Produto
- Clique em **"Criar Produto"**
- O sistema salvará o produto
- Em seguida, fará upload das imagens automaticamente
- Aguarde até "Upload de imagens..." completar
- O produto aparecerá no catálogo com as imagens

### Editar Produto Existente

#### 1. Localizar o Produto
- No catálogo, produtos terão dois botões no canto superior esquerdo:
  - **Ícone de Lápis** (amarelo): Editar
  - **Ícone de Lixeira** (vermelho): Excluir

#### 2. Clicar em Editar
- O modal será aberto com os dados atuais do produto
- Todos os campos podem ser modificados

#### 3. Modificar Variantes
- Edite variantes existentes
- Adicione novas variantes
- Remova variantes desnecessárias

#### 4. Gerenciar Imagens
- **Ver imagens existentes**: Aparecem com badge "Existente"
- **Adicionar novas imagens**: Clique na área de upload
- **Remover imagens**: Hover sobre a imagem e clique no X
- **Adicionar mais imagens**: Produtos podem ter múltiplas imagens

#### 5. Salvar Alterações
- Clique em **"Atualizar Produto"**
- Novas imagens serão enviadas automaticamente
- As mudanças serão aplicadas imediatamente

### Excluir Produto

#### 1. Clicar no Ícone de Lixeira
- Botão vermelho no canto superior esquerdo do card

#### 2. Confirmar Exclusão
- Uma mensagem de confirmação será exibida
- Clique em **OK** para confirmar
- O produto será removido permanentemente

**⚠️ ATENÇÃO**: A exclusão é permanente e não pode ser desfeita!

## Funcionalidades Administrativas

### Visibilidade de Produtos
- **Produtos Ativos** (`is_active=true`): Visíveis para todos os usuários
- **Produtos Inativos** (`is_active=false`): Visíveis apenas para administradores

### Controles Visuais
- **Badge ADMIN**: Aparece no navbar ao lado do nome do usuário
- **Botão "Novo Produto"**: Visível apenas para admins no catálogo
- **Botões de Editar/Excluir**: Aparecem sobre cada produto no catálogo

### Filtros e Busca
Administradores podem usar todos os filtros normais:
- Busca por nome/descrição
- Filtro por categoria
- Ordenação (mais recentes, preço, nome)

## Fluxo de Trabalho Recomendado

### Adicionar Novo Produto ao Catálogo

1. **Preparar Informações**
   - Nome do produto
   - Descrição detalhada
   - Preço
   - Categoria
   - Lista de tamanhos e cores disponíveis
   - Quantidade em estoque de cada variante

2. **Criar o Produto**
   - Acessar Catálogo
   - Clicar em "Novo Produto"
   - Preencher informações básicas
   - Adicionar todas as variantes
   - Marcar como "ativo" se pronto para venda
   - Salvar

3. **Adicionar Imagens** (futuro)
   - Atualmente, imagens devem ser adicionadas via API
   - Funcionalidade de upload será adicionada em breve

4. **Verificar no Catálogo**
   - O produto aparecerá imediatamente
   - Testar visualização como usuário comum (logout)

### Atualizar Estoque

1. **Localizar o Produto**
   - Buscar no catálogo

2. **Editar Produto**
   - Clicar no ícone de lápis

3. **Atualizar Variantes**
   - Modificar campo "Estoque" das variantes
   - Adicionar novas variantes se necessário

4. **Salvar**
   - Clicar em "Atualizar Produto"

### Desativar Produto Temporariamente

1. **Editar o Produto**
2. **Desmarcar "Produto ativo"**
3. **Salvar**

O produto ficará oculto para clientes, mas visível para admins.

## Permissões e Segurança

### Endpoints Protegidos
Apenas usuários com `is_staff=true` podem:
- Criar produtos (`POST /api/products/`)
- Atualizar produtos (`PUT /api/products/{id}/`)
- Excluir produtos (`DELETE /api/products/{id}/`)
- Upload de imagens (`POST /api/products/{id}/upload-image/`)

### Autenticação
- Token JWT é enviado automaticamente em todas as requisições
- Se o token expirar, o usuário será redirecionado para login

## Troubleshooting

### "Erro ao salvar produto"
**Possíveis causas:**
- Campos obrigatórios não preenchidos
- Preço inválido (deve ser maior que zero)
- Categoria não selecionada
- Token de autenticação expirado

**Solução:**
- Verificar todos os campos obrigatórios (marcados com *)
- Fazer logout e login novamente
- Verificar console do navegador para detalhes do erro

### "Produto não aparece no catálogo"
**Possíveis causas:**
- Produto marcado como inativo
- Sem variantes com estoque

**Solução:**
- Editar produto e marcar como "ativo"
- Adicionar variantes com estoque > 0

### "Botão 'Novo Produto' não aparece"
**Possíveis causas:**
- Usuário não é administrador
- Não está logado

**Solução:**
- Verificar se há badge "ADMIN" no navbar
- Fazer login com conta de administrador
- Verificar com desenvolvedor se `is_staff=true` no banco de dados

## API Endpoints (Referência)

### Produtos
```
GET    /api/products/          - Listar produtos
POST   /api/products/          - Criar produto (admin)
GET    /api/products/{id}/     - Detalhes do produto
PUT    /api/products/{id}/     - Atualizar produto (admin)
DELETE /api/products/{id}/     - Excluir produto (admin)
POST   /api/products/{id}/upload-image/ - Upload de imagem (admin)
```

### Categorias
```
GET    /api/categories/        - Listar categorias
```

### Usuário
```
GET    /api/user/profile/      - Perfil do usuário (inclui is_staff)
```

## Próximas Funcionalidades

### Em Desenvolvimento
- [x] Upload de imagens diretamente no modal
- [x] Gerenciamento de múltiplas imagens por produto
- [ ] Reordenação de imagens (drag and drop)
- [ ] Edição em massa de produtos
- [ ] Importação/Exportação de produtos (CSV)
- [ ] Histórico de alterações
- [ ] Dashboard administrativo com estatísticas

### Planejado
- [ ] Gerenciamento de categorias
- [ ] Gerenciamento de pedidos
- [ ] Relatórios de vendas
- [ ] Controle de usuários
- [ ] Cupons de desconto

## Suporte

Para dúvidas ou problemas:
1. Verificar este guia
2. Consultar console do navegador (F12)
3. Contatar o desenvolvedor
