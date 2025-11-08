import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  
  const [preferences, setPreferences] = useState({
    essential: true, // Sempre true, não pode ser desativado
    functional: true,
    analytics: true
  })

  useEffect(() => {
    // Verifica se o usuário já deu consentimento
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Aguarda 1 segundo antes de mostrar o banner
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    } else {
      // Carrega preferências salvas
      try {
        const saved = JSON.parse(consent)
        setPreferences(prev => ({ ...prev, ...saved }))
      } catch (e) {
        console.error('Erro ao carregar preferências de cookies', e)
      }
    }
  }, [])

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted))
    setShowBanner(false)
  }

  const acceptSelected = () => {
    const selected = {
      ...preferences,
      essential: true, // Sempre true
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookie_consent', JSON.stringify(selected))
    setShowBanner(false)
  }

  const rejectNonEssential = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookie_consent', JSON.stringify(essentialOnly))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
      
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up">
        <div className="mx-auto max-w-6xl bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border-2 border-primary-200 dark:border-primary-800">
          <div className="p-6 sm:p-8">
            {!showPreferences ? (
              // Banner Principal
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Ícone */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    🍪 Nós usamos cookies
                  </h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                    Utilizamos cookies essenciais para o funcionamento do site e cookies opcionais 
                    para melhorar sua experiência. Você pode escolher quais aceitar.
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Ao continuar navegando, você concorda com nossa{' '}
                    <Link to="/cookies" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                      Política de Cookies
                    </Link>
                    {' '}e{' '}
                    <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                      Política de Privacidade
                    </Link>.
                  </p>
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors font-semibold text-sm whitespace-nowrap"
                  >
                    ⚙️ Preferências
                  </button>
                  <button
                    onClick={rejectNonEssential}
                    className="px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors font-semibold text-sm whitespace-nowrap"
                  >
                    Apenas Essenciais
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold text-sm shadow-lg whitespace-nowrap"
                  >
                    ✓ Aceitar Todos
                  </button>
                </div>
              </div>
            ) : (
              // Painel de Preferências
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    Preferências de Cookies
                  </h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Cookies Essenciais */}
                  <div className="bg-neutral-50 dark:bg-neutral-700/50 p-5 rounded-xl border border-neutral-200 dark:border-neutral-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                          🔒 Cookies Essenciais
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Necessários para o funcionamento básico do site (autenticação, carrinho, segurança). 
                          Não podem ser desativados.
                        </p>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-6 bg-success-500 rounded-full flex items-center justify-end px-1">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <p className="text-xs text-success-600 dark:text-success-400 mt-1 font-semibold">Sempre Ativo</p>
                      </div>
                    </div>
                  </div>

                  {/* Cookies Funcionais */}
                  <div className="bg-neutral-50 dark:bg-neutral-700/50 p-5 rounded-xl border border-neutral-200 dark:border-neutral-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                          ⚡ Cookies Funcionais
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Melhoram a funcionalidade e personalização (preferências, idioma, produtos visualizados).
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => setPreferences(prev => ({ ...prev, functional: !prev.functional }))}
                          className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                            preferences.functional 
                              ? 'bg-primary-600 justify-end' 
                              : 'bg-neutral-300 dark:bg-neutral-600 justify-start'
                          } px-1`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cookies de Análise */}
                  <div className="bg-neutral-50 dark:bg-neutral-700/50 p-5 rounded-xl border border-neutral-200 dark:border-neutral-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                          📊 Cookies de Análise
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Ajudam-nos a entender como você usa o site para melhorar a experiência.
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                          className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                            preferences.analytics 
                              ? 'bg-primary-600 justify-end' 
                              : 'bg-neutral-300 dark:bg-neutral-600 justify-start'
                          } px-1`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={rejectNonEssential}
                    className="flex-1 px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors font-semibold"
                  >
                    Rejeitar Todos
                  </button>
                  <button
                    onClick={acceptSelected}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg"
                  >
                    Salvar Preferências
                  </button>
                  <button
                    onClick={acceptAll}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all font-semibold shadow-lg"
                  >
                    Aceitar Todos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
