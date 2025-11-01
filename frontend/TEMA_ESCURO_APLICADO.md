# 🌓 Tema Escuro - Status de Implementação

## ✅ Componentes Atualizados

### Componentes Base
- [x] **App.jsx** - Container principal com dark:bg-neutral-900
- [x] **Navbar.jsx** - Completamente atualizado com tema escuro
- [ ] Footer.jsx
- [ ] ProductCard.jsx
- [ ] SearchBar.jsx
- [ ] SupportChat.jsx
- [ ] OrderModal.jsx
- [ ] ProductModal.jsx
- [ ] BulkActions.jsx
- [ ] Breadcrumbs.jsx

## 🎨 Padrão de Classes Aplicado

### Backgrounds
```
bg-white → bg-white dark:bg-neutral-800
bg-neutral-50 → bg-neutral-50 dark:bg-neutral-900
bg-neutral-100 → bg-neutral-100 dark:bg-neutral-800
bg-gray-50 → bg-gray-50 dark:bg-neutral-900
```

### Textos
```
text-neutral-900 → text-neutral-900 dark:text-neutral-100
text-neutral-700 → text-neutral-700 dark:text-neutral-300
text-neutral-600 → text-neutral-600 dark:text-neutral-400
text-gray-900 → text-gray-900 dark:text-neutral-100
```

### Borders
```
border-neutral-200 → border-neutral-200 dark:border-neutral-700
border-neutral-300 → border-neutral-300 dark:border-neutral-600
```

### Hover States
```
hover:bg-neutral-100 → hover:bg-neutral-100 dark:hover:bg-neutral-700
hover:text-primary-700 → hover:text-primary-700 dark:hover:text-primary-400
```

## 📝 Próximos Passos

Devido à complexidade e número de arquivos (50+), recomendo:

### Opção 1: Implementação Manual Gradual
1. Atualizar componentes por prioridade
2. Testar cada componente individualmente
3. Ajustar cores conforme necessário

### Opção 2: Usar Find & Replace no VS Code
1. Abrir busca global (Ctrl+Shift+H)
2. Usar regex para substituir padrões
3. Revisar cada mudança

### Opção 3: Continuar Manualmente
Posso continuar atualizando arquivo por arquivo, mas levará tempo.

## 🎯 Componentes Críticos Restantes

### Alta Prioridade (Visíveis sempre)
1. Footer.jsx
2. ProductCard.jsx
3. SearchBar.jsx

### Média Prioridade (Páginas principais)
4. Home.jsx
5. Catalog.jsx
6. Product.jsx
7. Cart.jsx

### Baixa Prioridade (Admin)
8. Dashboard.jsx (já tem algumas classes)
9. Orders.jsx
10. Products.jsx

## 💡 Recomendação

Para economizar tempo, sugiro usar o VS Code Find & Replace com regex:

### Buscar:
```
className="([^"]*?)bg-white([^"]*?)"
```

### Substituir por:
```
className="$1bg-white dark:bg-neutral-800$2"
```

Repetir para cada padrão de cor.

---

**Status**: 🟡 10% Implementado
**Próximo**: Continuar com componentes restantes
