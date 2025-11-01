# 🛠️ Comandos Úteis - BASE CORPORATIVA Frontend

## 📦 Instalação e Desenvolvimento

### Instalar Dependências
```bash
npm install
```

### Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:5173

### Build para Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

---

## 🧪 Testes e Qualidade

### Verificar Vulnerabilidades
```bash
npm audit
```

### Corrigir Vulnerabilidades (cuidado!)
```bash
npm audit fix
```

### Limpar Cache e Reinstalar
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Tailwind CSS

### Gerar Classes Tailwind
```bash
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

### Ver Configuração do Tailwind
```bash
npx tailwindcss init --full
```

---

## 📱 PWA

### Testar Service Worker Localmente
```bash
npm run build
npx serve -s dist -p 3000
```
Acesse: http://localhost:3000

### Verificar Manifest
Abra DevTools > Application > Manifest

### Limpar Cache do Service Worker
```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister()
  }
})
```

---

## 🔍 Debug

### Ver Logs do Service Worker
1. Abra DevTools (F12)
2. Application > Service Workers
3. Veja logs e status

### Simular Conexão Lenta
1. DevTools > Network
2. Throttling > Slow 3G

### Simular Offline
1. DevTools > Network
2. Throttling > Offline

---

## 📊 Performance

### Analisar Bundle Size
```bash
npm run build -- --mode analyze
```

### Lighthouse Audit
1. DevTools > Lighthouse
2. Generate Report
3. Veja métricas

---

## 🎯 Atalhos de Desenvolvimento

### Recarregar Página
- **Ctrl + R** (Windows/Linux)
- **Cmd + R** (Mac)

### Recarregar Ignorando Cache
- **Ctrl + Shift + R** (Windows/Linux)
- **Cmd + Shift + R** (Mac)

### Abrir DevTools
- **F12** ou **Ctrl + Shift + I**

### Inspecionar Elemento
- **Ctrl + Shift + C**

---

## 🔧 Comandos Git Úteis

### Status do Repositório
```bash
git status
```

### Adicionar Mudanças
```bash
git add .
```

### Commit
```bash
git commit -m "feat: adiciona melhorias no frontend"
```

### Push
```bash
git push origin main
```

### Ver Histórico
```bash
git log --oneline --graph
```

---

## 📝 Scripts Personalizados

### Criar Componente
```bash
# Crie um script em package.json
"scripts": {
  "create:component": "node scripts/createComponent.js"
}
```

### Limpar Build
```bash
# Adicione ao package.json
"scripts": {
  "clean": "rm -rf dist"
}
```

---

## 🌐 Deploy

### Build para Produção
```bash
npm run build
```

### Deploy no Netlify
```bash
netlify deploy --prod
```

### Deploy no Vercel
```bash
vercel --prod
```

### Deploy no Railway
```bash
railway up
```

---

## 🐛 Troubleshooting

### Erro: "Module not found"
```bash
npm install
```

### Erro: "Port already in use"
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### Erro: "Permission denied"
```bash
# Linux/Mac
sudo chown -R $USER:$USER .
```

### Limpar Cache do Vite
```bash
rm -rf node_modules/.vite
```

---

## 📚 Documentação Rápida

### React Router
```javascript
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

const navigate = useNavigate()
navigate('/path')

const { id } = useParams()

const [searchParams, setSearchParams] = useSearchParams()
```

### React Hot Toast
```javascript
import toast from 'react-hot-toast'

toast.success('Sucesso!')
toast.error('Erro!')
toast.loading('Carregando...')
toast.promise(promise, {
  loading: 'Carregando...',
  success: 'Sucesso!',
  error: 'Erro!'
})
```

### Chart.js
```javascript
import { Line, Bar, Doughnut } from 'react-chartjs-2'

<Line data={data} options={options} />
```

---

## 🎨 Tailwind Classes Úteis

### Layout
```
flex, grid, container, mx-auto
```

### Spacing
```
p-4, m-4, gap-4, space-x-4
```

### Colors
```
bg-primary-600, text-white, border-neutral-200
```

### Responsive
```
sm:, md:, lg:, xl:, 2xl:
```

### Dark Mode
```
dark:bg-gray-900, dark:text-white
```

---

## 🔐 Variáveis de Ambiente

### Criar .env.local
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CATALOG_PDF_URL=http://localhost:8000/media/catalog/catalogo.pdf
```

### Usar no Código
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

---

## 📦 Atualizar Dependências

### Ver Dependências Desatualizadas
```bash
npm outdated
```

### Atualizar Todas (cuidado!)
```bash
npm update
```

### Atualizar Específica
```bash
npm install react@latest
```

---

## 🎯 Comandos Rápidos do Dia a Dia

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview

# Instalar nova dependência
npm install <package>

# Remover dependência
npm uninstall <package>

# Limpar e reinstalar
rm -rf node_modules && npm install

# Ver versão do Node
node -v

# Ver versão do npm
npm -v
```

---

## 🚀 Checklist de Deploy

- [ ] `npm run build` sem erros
- [ ] Testar build localmente (`npm run preview`)
- [ ] Verificar variáveis de ambiente
- [ ] Testar em diferentes navegadores
- [ ] Testar responsividade
- [ ] Lighthouse score > 90
- [ ] Commit e push para repositório
- [ ] Deploy para produção
- [ ] Verificar site em produção
- [ ] Testar PWA em produção

---

**Mantenha este arquivo atualizado conforme adiciona novos comandos!** 📝
