import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import logo from '../assets/img/LOGO-BASE-CORPORATIVA.png'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCart()
  const { user, logout, isAuthenticated } = useAuth()
  const cartItemsCount = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="BASE CORPORATIVA" 
              className="h-8 w-auto transition-transform group-hover:scale-105" 
            />
            <span className="text-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent tracking-wide hidden sm:block">
              BASE CORPORATIVA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/about"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary-950 ${
                  isActive ? 'text-primary-950' : 'text-neutral-600'
                }`
              }
            >
              Sobre nós
            </NavLink>
            <NavLink 
              to="/catalog"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary-950 ${
                  isActive ? 'text-primary-950' : 'text-neutral-600'
                }`
              }
            >
              Catálogo
            </NavLink>
            <NavLink 
              to="/cart"
              className={({ isActive }) =>
                `relative text-sm font-medium transition-colors hover:text-primary-950 ${
                  isActive ? 'text-primary-950' : 'text-neutral-600'
                }`
              }
            >
              Carrinho
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartItemsCount}
                </span>
              )}
            </NavLink>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NavLink 
                  to="/orders"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary-950 ${
                      isActive ? 'text-primary-950' : 'text-neutral-600'
                    }`
                  }
                >
                  Meus Pedidos
                </NavLink>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600">Olá, {user?.username}</span>
                  {user?.is_staff && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-bronze-800 text-white rounded">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium rounded-md transition-all text-neutral-600 hover:bg-primary-50 hover:text-primary-700 border border-transparent hover:border-primary-200"
                >
                  Sair
                </button>
              </div>
            ) : (
              <NavLink 
                to="/login"
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    isActive 
                      ? 'bg-bronze-800 text-white' 
                      : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-700 border border-transparent hover:border-primary-200'
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
            className="md:hidden p-2 rounded-md text-neutral-600 hover:text-primary-950 hover:bg-neutral-100 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 animate-slide-up">
            <nav className="flex flex-col space-y-3">
              <NavLink 
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive ? 'bg-primary-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`
                }
              >
                Sobre nós
              </NavLink>
              <NavLink 
                to="/catalog"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive ? 'bg-primary-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`
                }
              >
                Catálogo
              </NavLink>
              <NavLink 
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 text-base font-medium rounded-md transition-colors flex items-center justify-between ${
                    isActive ? 'bg-primary-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`
                }
              >
                <span>Carrinho</span>
                {cartItemsCount > 0 && (
                  <span className="bg-primary-950 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </NavLink>
              {isAuthenticated && (
                <NavLink 
                  to="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive ? 'bg-primary-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                    }`
                  }
                >
                  Meus Pedidos
                </NavLink>
              )}
              <NavLink 
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive ? 'bg-primary-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`
                }
              >
                Entrar
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
