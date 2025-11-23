import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Componente que força scroll para o topo em toda mudança de rota
 * 
 * Usage: Adicionar no App.jsx dentro do <Router>
 * <BrowserRouter>
 *   <ScrollToTop />
 *   <Routes>...</Routes>
 * </BrowserRouter>
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll para o topo instantaneamente
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 'instant' é mais rápido que 'smooth'
    })
    
    // Alternativa para garantir em todos os navegadores
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  return null // Componente não renderiza nada
}
