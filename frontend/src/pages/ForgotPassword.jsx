import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/auth/password-reset/', { email })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar email. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-soft p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-success-100 p-3">
                  <CheckCircle className="h-16 w-16 text-success-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Email Enviado!
              </h2>
              <p className="text-neutral-600 mb-6">
                Se existir uma conta com o email <strong>{email}</strong>, você receberá instruções para redefinir sua senha.
              </p>
              <div className="bg-bronze-50 border border-bronze-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-bronze-800">
                  <strong>Importante:</strong> Verifique também sua caixa de spam. O link expira em 1 hora.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-bronze-800 hover:bg-bronze-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar para Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-950 mb-2">Esqueceu sua senha?</h1>
          <p className="text-neutral-600">
            Digite seu email e enviaremos instruções para redefinir sua senha.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-bronze-600 focus:border-transparent transition-all"
                  placeholder="Digite seu e-mail"
                />
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
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 mr-2" />
                  Enviar Instruções
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-bronze-600 hover:text-bronze-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Login
            </Link>
            <p className="text-sm text-neutral-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-medium text-primary-800 hover:text-primary-950">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
