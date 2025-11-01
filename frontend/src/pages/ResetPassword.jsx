import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordStrength = formData.password.length >= 8 ? 'strong' : 
                          formData.password.length >= 6 ? 'medium' : 
                          formData.password.length > 0 ? 'weak' : 'none'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Validações
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      await api.post('/api/auth/password-reset/confirm/', {
        token,
        password: formData.password
      })
      setSuccess(true)
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login', { state: { message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' } })
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Token inválido ou expirado. Solicite um novo link de redefinição.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-success-100 p-3">
                  <CheckCircle className="h-16 w-16 text-success-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Senha Redefinida!
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Sua senha foi redefinida com sucesso. Você já pode fazer login com sua nova senha.
              </p>
              <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-success-800">
                  Redirecionando para a página de login em alguns segundos...
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-bronze-800 hover:bg-bronze-700 transition-colors"
              >
                Ir para Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-950 mb-2">Redefinir Senha</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Digite sua nova senha abaixo.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-10 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-bronze-600 focus:border-transparent transition-all"
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:text-neutral-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    <div className={`h-1 w-1/3 rounded ${passwordStrength === 'none' ? 'bg-neutral-200' : passwordStrength === 'weak' ? 'bg-error-400' : passwordStrength === 'medium' ? 'bg-warning-400' : 'bg-success-400'}`}></div>
                    <div className={`h-1 w-1/3 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? passwordStrength === 'medium' ? 'bg-warning-400' : 'bg-success-400' : 'bg-neutral-200'}`}></div>
                    <div className={`h-1 w-1/3 rounded ${passwordStrength === 'strong' ? 'bg-success-400' : 'bg-neutral-200'}`}></div>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    {passwordStrength === 'weak' && 'Senha fraca'}
                    {passwordStrength === 'medium' && 'Senha média'}
                    {passwordStrength === 'strong' && 'Senha forte'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full pl-10 pr-10 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-bronze-600 focus:border-transparent transition-all"
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:text-neutral-400"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-bronze-800 hover:bg-bronze-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bronze-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-bronze-600 hover:text-bronze-700 dark:hover:text-bronze-400">
              Voltar para Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
