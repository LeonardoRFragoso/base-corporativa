# 🚀 Guia Rápido: Aplicar Tema Escuro com VS Code

## ⚡ Método Mais Rápido (5-10 minutos)

Use o Find & Replace do VS Code com Regex para atualizar TODOS os arquivos de uma vez.

### 📋 Passo a Passo

1. **Abrir Find & Replace Global**
   - Pressione `Ctrl + Shift + H` (Windows/Linux)
   - Ou `Cmd + Shift + H` (Mac)

2. **Habilitar Regex**
   - Clique no botão `.*` (Use Regular Expression)
   - Ou pressione `Alt + R`

3. **Configurar Filtros**
   - Em "files to include": `src/**/*.jsx`
   - Em "files to exclude": `*.backup.jsx, *.old.jsx`

---

## 🎨 Substituições (Execute na Ordem)

### 1. Backgrounds - Branco
**Buscar:**
```
className="([^"]*?)bg-white([^"]*?)"
```
**Substituir:**
```
className="$1bg-white dark:bg-neutral-800$2"
```
**Ação:** Replace All

---

### 2. Backgrounds - Neutral 50
**Buscar:**
```
className="([^"]*?)bg-neutral-50([^"]*?)"
```
**Substituir:**
```
className="$1bg-neutral-50 dark:bg-neutral-900$2"
```
**Ação:** Replace All

---

### 3. Backgrounds - Gray 50
**Buscar:**
```
className="([^"]*?)bg-gray-50([^"]*?)"
```
**Substituir:**
```
className="$1bg-gray-50 dark:bg-neutral-900$2"
```
**Ação:** Replace All

---

### 4. Backgrounds - Neutral 100
**Buscar:**
```
className="([^"]*?)bg-neutral-100([^"]*?)"
```
**Substituir:**
```
className="$1bg-neutral-100 dark:bg-neutral-800$2"
```
**Ação:** Replace All

---

### 5. Texto - Neutral 900
**Buscar:**
```
className="([^"]*?)text-neutral-900([^"]*?)"
```
**Substituir:**
```
className="$1text-neutral-900 dark:text-neutral-100$2"
```
**Ação:** Replace All

---

### 6. Texto - Gray 900
**Buscar:**
```
className="([^"]*?)text-gray-900([^"]*?)"
```
**Substituir:**
```
className="$1text-gray-900 dark:text-neutral-100$2"
```
**Ação:** Replace All

---

### 7. Texto - Neutral 700
**Buscar:**
```
className="([^"]*?)text-neutral-700([^"]*?)"
```
**Substituir:**
```
className="$1text-neutral-700 dark:text-neutral-300$2"
```
**Ação:** Replace All

---

### 8. Texto - Neutral 600
**Buscar:**
```
className="([^"]*?)text-neutral-600([^"]*?)"
```
**Substituir:**
```
className="$1text-neutral-600 dark:text-neutral-400$2"
```
**Ação:** Replace All

---

### 9. Borders - Neutral 200
**Buscar:**
```
className="([^"]*?)border-neutral-200([^"]*?)"
```
**Substituir:**
```
className="$1border-neutral-200 dark:border-neutral-700$2"
```
**Ação:** Replace All

---

### 10. Borders - Gray 200
**Buscar:**
```
className="([^"]*?)border-gray-200([^"]*?)"
```
**Substituir:**
```
className="$1border-gray-200 dark:border-neutral-700$2"
```
**Ação:** Replace All

---

### 11. Borders - Neutral 300
**Buscar:**
```
className="([^"]*?)border-neutral-300([^"]*?)"
```
**Substituir:**
```
className="$1border-neutral-300 dark:border-neutral-600$2"
```
**Ação:** Replace All

---

## ⚠️ IMPORTANTE

### Antes de Executar:
1. ✅ **Commit suas mudanças atuais** (para poder reverter se necessário)
2. ✅ **Feche arquivos desnecessários** no VS Code
3. ✅ **Revise cada substituição** antes de clicar "Replace All"

### Depois de Executar:
1. ✅ **Revise as mudanças** com Git Diff
2. ✅ **Teste no navegador** (npm run dev)
3. ✅ **Verifique páginas principais**:
   - Home
   - Catalog
   - Product
   - Cart
   - Admin Dashboard

---

## 🎯 Substituições Adicionais (Opcional)

### Hover States
```
Buscar: hover:bg-neutral-100
Substituir: hover:bg-neutral-100 dark:hover:bg-neutral-700
```

```
Buscar: hover:bg-gray-100
Substituir: hover:bg-gray-100 dark:hover:bg-neutral-700
```

```
Buscar: hover:text-primary-700
Substituir: hover:text-primary-700 dark:hover:text-primary-400
```

---

## 🧪 Como Testar

1. **Iniciar servidor**:
   ```bash
   npm run dev
   ```

2. **Abrir navegador**: http://localhost:5173

3. **Clicar no ícone de lua** no Navbar

4. **Verificar se**:
   - ✅ Background fica escuro
   - ✅ Cards ficam escuros
   - ✅ Textos ficam claros
   - ✅ Borders ficam visíveis
   - ✅ Hover funciona

---

## 🔄 Se Algo Der Errado

### Reverter Mudanças:
```bash
git checkout -- src/
```

### Ou usar o VS Code:
1. Source Control (Ctrl+Shift+G)
2. Discard Changes

---

## 📊 Resultado Esperado

Após executar todas as substituições:

- ✅ **~50 arquivos** atualizados
- ✅ **~500+ classes** com dark mode
- ✅ **100% dos componentes** com tema escuro
- ✅ **Tempo total**: 5-10 minutos

---

## 💡 Dicas

1. **Execute uma substituição por vez**
2. **Revise o preview** antes de Replace All
3. **Teste frequentemente** durante o processo
4. **Use Git** para rastrear mudanças
5. **Documente** problemas encontrados

---

## 🎉 Pronto!

Após seguir este guia, seu tema escuro estará **100% funcional** em:
- ✅ Todas as páginas cliente
- ✅ Todas as páginas admin
- ✅ Todos os modais
- ✅ Todos os componentes

**Tempo estimado**: 5-10 minutos
**Dificuldade**: Fácil
**Resultado**: Tema escuro completo!

---

**Boa sorte! 🚀**
