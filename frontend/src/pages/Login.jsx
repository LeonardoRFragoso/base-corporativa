import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Mostrar mensagem de sucesso se vier de outra página
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Limpar o estado após mostrar
      window.history.replaceState({}, document.title)
    }
  }, [location])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function validateForm() {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'Usuário é obrigatório'
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setEmailNotVerified(false)
    
    try {
      console.log('Attempting login with:', formData.username)
      const ok = await login(formData.username, formData.password)
      console.log('Login result:', ok)
      if (ok) {
        console.log('Login successful, navigating to home')
        navigate('/')
      } else {
        console.log('Login failed - no success returned')
        setErrors({ general: 'Login falhou. Tente novamente.' })
      }
    } catch (err) {
      console.error('Login error caught:', err)
      
      // Verificar se é erro de email não verificado
      if (err.response?.data?.email_not_verified) {
        setEmailNotVerified(true)
        setUserEmail(formData.username)
        setErrors({ general: err.response.data.detail || 'Por favor, verifique seu email antes de fazer login.' })
      } else {
        setErrors({ general: 'Login falhou. Verifique suas credenciais.' })
      }
    }
  }

  async function handleResendVerification() {
    try {
      await api.post('/api/auth/resend-verification/', { email: userEmail })
      setSuccessMessage('Email de verificação reenviado! Verifique sua caixa de entrada.')
      setEmailNotVerified(false)
      setErrors({})
    } catch (err) {
      setErrors({ general: 'Erro ao reenviar email. Tente novamente.' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-lg w-full space-y-10">
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">Entrar na sua conta</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Acesse sua conta <span className="text-primary-700 font-semibold">BASE CORPORATIVA</span></p>
        </div>

        <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-neutral-900/50 p-10 border border-neutral-200 dark:border-neutral-700">
          <form onSubmit={onSubmit} className="space-y-6">
            {successMessage && (
              <div className="bg-success-50 border-2 border-success-300 text-success-700 px-5 py-4 rounded-xl text-base font-medium">
                {successMessage}
              </div>
            )}

            {errors.general && (
              <div className="bg-error-50 border-2 border-error-300 text-error-700 px-5 py-4 rounded-xl">
                <p className="text-base font-medium">{errors.general}</p>
                {emailNotVerified && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="mt-3 w-full text-sm font-medium text-bronze-700 hover:text-bronze-800 underline"
                  >
                    Reenviar email de verificação
                  </button>
                )}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Usuário ou E-mail
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                required
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-4 bg-white dark:bg-neutral-700 border-2 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 transition-all text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 ${
                  errors.username ? 'border-error-300 bg-error-50 dark:bg-error-900/20 dark:border-error-600' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="Digite seu usuário ou e-mail"
              />
              {errors.username && (
                <p className="mt-2 text-sm text-error-600 font-medium">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 pr-12 bg-white dark:bg-neutral-700 border-2 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 transition-all text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 ${
                    errors.password ? 'border-error-300 bg-error-50 dark:bg-error-900/20 dark:border-error-600' : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-error-600 font-medium">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-primary-700 focus:ring-primary-600 border-neutral-300 dark:border-neutral-600 rounded"
                />
                <label htmlFor="remember-me" className="ml-3 block text-base text-neutral-700 dark:text-neutral-300 font-medium">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-base">
                <Link to="/forgot-password" className="text-primary-700 hover:text-primary-800 font-semibold">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-5 px-6 border border-transparent rounded-xl shadow-xl text-lg font-bold text-white bg-gradient-to-r from-bronze-700 to-bronze-800 hover:from-bronze-600 hover:to-bronze-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bronze-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 hover:shadow-2xl"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-neutral-600 dark:text-neutral-400">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-bold text-primary-700 hover:text-primary-800">
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
