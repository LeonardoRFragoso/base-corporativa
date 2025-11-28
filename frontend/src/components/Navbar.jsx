import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search, Moon, Sun, GitCompare } from 'lucide-react'
import logo from '../assets/img/LOGO-BASE-CORPORATIVA.png'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useCompare } from '../context/CompareContext.jsx'
import SearchBar from './SearchBar.jsx'
import NotificationBell from './NotificationBell.jsx'

export default function Navbar() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { items } = useCart()
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { compareItems } = useCompare()
  const cartItemsCount = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <header className="sticky top-0 z-50 bg-white/98 dark:bg-neutral-800/98 backdrop-blur-lg border-b-2 border-neutral-200 dark:border-neutral-700 shadow-2xl transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-bronze-400 rounded-lg blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <img 
                src={logo}
                alt="BASE CORPORATIVA"
                className="relative h-8 sm:h-9 md:h-10 w-auto transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
              />
            </div>
            <span className="text-sm sm:text-base md:text-xl font-display font-bold bg-gradient-to-r from-primary-700 via-primary-800 to-bronze-700 dark:from-primary-400 dark:via-primary-500 dark:to-bronze-400 bg-clip-text text-transparent tracking-wide truncate">
              BASE CORPORATIVA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-neutral-700 dark:text-neutral-200 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-700 rounded-lg transition-all"
              aria-label="Buscar produtos"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <NavLink
              to="/compare"
              className="relative p-2 text-neutral-700 dark:text-neutral-200 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-700 rounded-lg transition-all"
              aria-label="Comparar produtos"
            >
              <GitCompare className="w-5 h-5" />
              {compareItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 dark:bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {compareItems.length}
                </span>
              )}
            </NavLink>
            
            <NotificationBell />
            
            <button
              onClick={toggleTheme}
              className="p-2 text-neutral-700 dark:text-neutral-200 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-700 rounded-lg transition-all"
              aria-label="Alternar tema"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <NavLink 
              to="/about"
              className={({ isActive }) =>
                `text-base font-semibold transition-all duration-200 hover:text-primary-700 dark:hover:text-primary-400 relative group ${
                  isActive ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-200'
                }`
              }
            >
              Sobre nós
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-bronze-700 transition-all duration-200 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              to="/catalog"
              className={({ isActive }) =>
                `text-base font-semibold transition-all duration-200 hover:text-primary-700 dark:hover:text-primary-400 relative group ${
                  isActive ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-200'
                }`
              }
            >
              Catálogo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-bronze-700 transition-all duration-200 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              to="/cart"
              className={({ isActive }) =>
                `relative text-base font-semibold transition-all duration-200 hover:text-primary-700 dark:hover:text-primary-400 group ${
                  isActive ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-200'
                }`
              }
            >
              Carrinho
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-bronze-700 transition-all duration-200 group-hover:w-full"></span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-gradient-to-r from-primary-600 to-bronze-700 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </NavLink>
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <NavLink 
                  to="/orders"
                  className={({ isActive }) =>
                    `text-base font-semibold transition-all duration-200 hover:text-primary-700 dark:hover:text-primary-400 relative group ${
                      isActive ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-200'
                    }`
                  }
                >
                  Meus Pedidos
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-bronze-700 transition-all duration-200 group-hover:w-full"></span>
                </NavLink>
                {user?.is_staff && (
                  <NavLink 
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `text-base font-semibold transition-all duration-200 hover:text-bronze-700 dark:hover:text-bronze-400 relative group ${
                        isActive ? 'text-bronze-700 dark:text-bronze-400' : 'text-neutral-700 dark:text-neutral-200'
                      }`
                    }
                  >
                    Dashboard Admin
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-bronze-600 to-bronze-700 transition-all duration-200 group-hover:w-full"></span>
                  </NavLink>
                )}
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary-50 to-bronze-50 dark:from-primary-900/20 dark:to-bronze-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
                  <span className="text-base font-medium text-neutral-700 dark:text-neutral-200">Olá, <span className="text-primary-700 dark:text-primary-400 font-bold">{user?.username}</span></span>
                  {user?.is_staff && (
                    <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-bronze-700 to-bronze-800 text-white rounded-full shadow-lg">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="px-5 py-2.5 text-base font-semibold rounded-lg transition-all duration-200 text-neutral-700 dark:text-neutral-200 hover:bg-error-50 dark:hover:bg-error-900/20 hover:text-error-700 dark:hover:text-error-400 border-2 border-transparent hover:border-error-300 dark:hover:border-error-700 hover:shadow-md"
                >
                  Sair
                </button>
              </div>
            ) : (
              <NavLink 
                to="/login"
                className={({ isActive }) =>
                  `px-6 py-2.5 text-base font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
                    isActive 
                      ? 'bg-gradient-to-r from-bronze-700 to-bronze-800 text-white' 
                      : 'bg-gradient-to-r from-bronze-700 to-bronze-800 dark:from-bronze-600 dark:to-bronze-700 text-white hover:from-bronze-600 hover:to-bronze-700'
                  }`
                }
              >
                Entrar
              </NavLink>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex-shrink-0 relative z-50 p-3 rounded-lg text-neutral-700 dark:text-neutral-200 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-700 transition-all duration-200"
            aria-label="Menu"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t-2 border-neutral-200 dark:border-neutral-700 animate-slide-up">
            <nav className="flex flex-col space-y-3">
              {/* Mobile Action Buttons */}
              <div className={`grid ${user?.is_staff ? 'grid-cols-4' : 'grid-cols-3'} gap-3 mb-3 px-2`}>
                <button
                  onClick={() => {
                    setIsSearchOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="flex flex-col items-center justify-center p-3 text-neutral-700 dark:text-neutral-200 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-700 rounded-xl transition-all"
                  aria-label="Buscar produtos"
                >
                  <Search className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Buscar</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/compare')
                    setIsMenuOpen(false)
                  }}
                  className="relative flex flex-col items-center justify-center p-3 text-neutral-700 dark:text-neutral-200 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-700 rounded-xl transition-all"
                  aria-label="Comparar produtos"
                >
                  <GitCompare className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Comparar</span>
                  {compareItems.length > 0 && (
                    <span className="absolute top-1 right-1 bg-primary-600 dark:bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {compareItems.length}
                    </span>
                  )}
                </button>
                
                {user?.is_staff && (
                  <div className="flex flex-col items-center justify-center p-3">
                    <NotificationBell />
                  </div>
                )}
                
                <button
                  onClick={toggleTheme}
                  className="flex flex-col items-center justify-center p-3 text-neutral-700 dark:text-neutral-200 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-700 rounded-xl transition-all"
                  aria-label="Alternar tema"
                >
                  {theme === 'light' ? <Moon className="w-6 h-6 mb-1" /> : <Sun className="w-6 h-6 mb-1" />}
                  <span className="text-xs font-medium">Tema</span>
                </button>
              </div>

              {/* Navigation Links */}
              <NavLink 
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                    isActive ? 'bg-gradient-to-r from-primary-700 to-bronze-700 text-white shadow-md' : 'text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-primary-700 dark:hover:text-primary-400'
                  }`
                }
              >
                Sobre nós
              </NavLink>
              <NavLink 
                to="/catalog"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                    isActive ? 'bg-gradient-to-r from-primary-700 to-bronze-700 text-white shadow-md' : 'text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-primary-700 dark:hover:text-primary-400'
                  }`
                }
              >
                Catálogo
              </NavLink>
              <NavLink 
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-base font-semibold rounded-xl transition-all flex items-center justify-between ${
                    isActive ? 'bg-gradient-to-r from-primary-700 to-bronze-700 text-white shadow-md' : 'text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-primary-700 dark:hover:text-primary-400'
                  }`
                }
              >
                <span>Carrinho</span>
                {cartItemsCount > 0 && (
                  <span className="bg-gradient-to-r from-primary-600 to-bronze-700 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-md">
                    {cartItemsCount}
                  </span>
                )}
              </NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink 
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                        isActive ? 'bg-gradient-to-r from-primary-700 to-bronze-700 text-white shadow-md' : 'text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-primary-700 dark:hover:text-primary-400'
                      }`
                    }
                  >
                    Meus Pedidos
                  </NavLink>
                  {user?.is_staff && (
                    <NavLink 
                      to="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                          isActive ? 'bg-gradient-to-r from-bronze-700 to-bronze-800 text-white shadow-md' : 'text-neutral-700 dark:text-neutral-200 hover:bg-bronze-50 dark:hover:bg-neutral-700 hover:text-bronze-700 dark:hover:text-bronze-400'
                        }`
                      }
                    >
                      Dashboard Admin
                    </NavLink>
                  )}
                  <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-bronze-50 dark:from-primary-900/20 dark:to-bronze-900/20 rounded-xl border border-primary-200 dark:border-primary-700">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Olá, <span className="text-primary-700 dark:text-primary-400 font-bold">{user?.username}</span></span>
                    {user?.is_staff && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-bronze-700 to-bronze-800 text-white rounded-full">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false) }}
                    className="px-4 py-3 text-base font-semibold rounded-xl transition-all text-neutral-700 dark:text-neutral-200 hover:bg-error-50 dark:hover:bg-error-900/20 hover:text-error-700 dark:hover:text-error-400 border-2 border-transparent hover:border-error-300 dark:hover:border-error-700 shadow-md"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <NavLink 
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 text-base font-bold rounded-xl transition-all shadow-md ${
                      isActive ? 'bg-gradient-to-r from-bronze-700 to-bronze-800 text-white' : 'bg-gradient-to-r from-bronze-700 to-bronze-800 dark:from-bronze-600 dark:to-bronze-700 text-white hover:from-bronze-600 hover:to-bronze-700'
                    }`
                  }
                >
                  Entrar
                </NavLink>
              )}
            </nav>
          </div>
        )}
      </div>
      
      {/* Search Modal */}
      {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
    </header>
  )
}
