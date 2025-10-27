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
    <header className="bg-white/98 backdrop-blur-lg border-b-2 border-neutral-200 shadow-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-bronze-400 rounded-lg blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <img 
                src={logo} 
                alt="BASE CORPORATIVA" 
                className="relative h-10 w-auto transition-all duration-300 group-hover:scale-110 drop-shadow-lg" 
              />
            </div>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-primary-700 via-primary-800 to-bronze-700 bg-clip-text text-transparent tracking-wide hidden sm:block">
              BASE CORPORATIVA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <NavLink 
              to="/about"
              className={({ isActive }) =>
                `text-base font-semibold transition-all duration-200 hover:text-primary-700 relative group ${
                  isActive ? 'text-primary-700' : 'text-neutral-700'
                }`
              }
            >
              Sobre nós
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-bronze-700 transition-all duration-200 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              to="/catalog"
              className={({ isActive }) =>
                `text-base font-semibold transition-all duration-200 hover:text-primary-700 relative group ${
                  isActive ? 'text-primary-700' : 'text-neutral-700'
                }`
              }
            >
              Catálogo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-bronze-700 transition-all duration-200 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              to="/cart"
              className={({ isActive }) =>
                `relative text-base font-semibold transition-all duration-200 hover:text-primary-700 group ${
                  isActive ? 'text-primary-700' : 'text-neutral-700'
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
                    `text-base font-semibold transition-all duration-200 hover:text-primary-700 relative group ${
                      isActive ? 'text-primary-700' : 'text-neutral-700'
                    }`
                  }
                >
                  Meus Pedidos
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-bronze-700 transition-all duration-200 group-hover:w-full"></span>
                </NavLink>
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary-50 to-bronze-50 rounded-lg border border-primary-200">
                  <span className="text-base font-medium text-neutral-700">Olá, <span className="text-primary-700 font-bold">{user?.username}</span></span>
                  {user?.is_staff && (
                    <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-bronze-700 to-bronze-800 text-white rounded-full shadow-lg">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="px-5 py-2.5 text-base font-semibold rounded-lg transition-all duration-200 text-neutral-700 hover:bg-error-50 hover:text-error-700 border-2 border-transparent hover:border-error-300 hover:shadow-md"
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
                      : 'bg-gradient-to-r from-bronze-700 to-bronze-800 text-white hover:from-bronze-600 hover:to-bronze-700'
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
            className="md:hidden p-3 rounded-lg text-neutral-700 hover:text-primary-700 hover:bg-primary-50 transition-all duration-200"
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
          <div className="md:hidden py-6 border-t-2 border-neutral-200 animate-slide-up">
            <nav className="flex flex-col space-y-3">
              <NavLink 
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                    isActive ? 'bg-gradient-to-r from-primary-700 to-bronze-700 text-white shadow-md' : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
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
                    isActive ? 'bg-gradient-to-r from-primary-700 to-bronze-700 text-white shadow-md' : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
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
                    isActive ? 'bg-gradient-to-r from-primary-700 to-bronze-700 text-white shadow-md' : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
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
              {isAuthenticated && (
                <NavLink 
                  to="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                      isActive ? 'bg-gradient-to-r from-primary-700 to-bronze-700 text-white shadow-md' : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
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
                  `px-4 py-3 text-base font-bold rounded-xl transition-all shadow-md ${
                    isActive ? 'bg-gradient-to-r from-bronze-700 to-bronze-800 text-white' : 'bg-gradient-to-r from-bronze-700 to-bronze-800 text-white hover:from-bronze-600 hover:to-bronze-700'
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
