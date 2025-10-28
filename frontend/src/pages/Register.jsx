import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value } = e.target
    let nextValue = value
    if (name === 'username') {
      nextValue = value
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9@.+_-]/g, '')
        .slice(0, 150)
    }
    setFormData(prev => ({ ...prev, [name]: nextValue }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function validateForm() {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'Usuário é obrigatório'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Usuário deve ter pelo menos 3 caracteres'
    } else if (!/^[\w.@+-]+$/.test(formData.username)) {
      newErrors.username = 'Use apenas letras, números e @/./+/-/_ (sem espaços)'
    } else if (formData.username.length > 150) {
      newErrors.username = 'Usuário deve ter no máximo 150 caracteres'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido'
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const response = await api.post('/api/auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      setSuccess(response.data.message || 'Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.')
      // Não redireciona automaticamente - usuário precisa verificar email primeiro
    } catch (err) {
      if (err.response?.data) {
        const serverErrors = {}
        Object.keys(err.response.data).forEach(key => {
          serverErrors[key] = Array.isArray(err.response.data[key]) 
            ? err.response.data[key][0] 
            : err.response.data[key]
        })
        setErrors(serverErrors)
      } else {
        setErrors({ general: 'Erro no cadastro. Tente novamente mais tarde.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = formData.password.length >= 8 ? 'strong' : 
                          formData.password.length >= 6 ? 'medium' : 
                          formData.password.length > 0 ? 'weak' : 'none'

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-10">
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">Criar sua conta</h1>
          <p className="text-lg text-neutral-600">Junte-se à <span className="text-primary-700 font-semibold">BASE CORPORATIVA</span></p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10">
          <form onSubmit={onSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-error-50 border-2 border-error-300 text-error-700 px-5 py-4 rounded-xl text-base font-medium">
                {errors.general}
              </div>
            )}

            {success && (
              <div className="bg-success-50 border-2 border-success-300 text-success-700 px-5 py-4 rounded-xl">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-success-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-sm">{success}</p>
                    <p className="text-xs mt-1 text-success-600">
                      Enviamos um email de verificação para <strong>{formData.email}</strong>. 
                      Verifique sua caixa de entrada e spam.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-base font-semibold text-neutral-700 mb-2">
                Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all text-base ${
                  errors.username ? 'border-error-300 bg-error-50' : 'border-neutral-300'
                }`}
                placeholder="Escolha um nome de usuário"
              />
              {errors.username && (
                <p className="mt-2 text-sm text-error-600 font-medium">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-base font-semibold text-neutral-700 mb-2">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all text-base ${
                  errors.email ? 'border-error-300 bg-error-50' : 'border-neutral-300'
                }`}
                placeholder="Digite seu e-mail"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-error-600 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-semibold text-neutral-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all text-base ${
                    errors.password ? 'border-error-300 bg-error-50' : 'border-neutral-300'
                  }`}
                  placeholder="Crie uma senha segura"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600"
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
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    <div className={`h-1 w-1/3 rounded ${passwordStrength === 'none' ? 'bg-neutral-200' : passwordStrength === 'weak' ? 'bg-error-400' : passwordStrength === 'medium' ? 'bg-warning-400' : 'bg-success-400'}`}></div>
                    <div className={`h-1 w-1/3 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? passwordStrength === 'medium' ? 'bg-warning-400' : 'bg-success-400' : 'bg-neutral-200'}`}></div>
                    <div className={`h-1 w-1/3 rounded ${passwordStrength === 'strong' ? 'bg-success-400' : 'bg-neutral-200'}`}></div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {passwordStrength === 'weak' && 'Senha fraca'}
                    {passwordStrength === 'medium' && 'Senha média'}
                    {passwordStrength === 'strong' && 'Senha forte'}
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-2 text-sm text-error-600 font-medium">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-base font-semibold text-neutral-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all text-base ${
                    errors.confirmPassword ? 'border-error-300 bg-error-50' : 'border-neutral-300'
                  }`}
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600"
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-error-600 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-5 px-6 border border-transparent rounded-xl shadow-xl text-lg font-bold text-white bg-gradient-to-r from-bronze-700 to-bronze-800 hover:from-bronze-600 hover:to-bronze-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bronze-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 hover:shadow-2xl"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Criando conta...
                </div>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-neutral-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-bold text-primary-700 hover:text-primary-800">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
