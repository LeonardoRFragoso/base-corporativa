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
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-12">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-success-100 p-4">
                  <CheckCircle className="h-20 w-20 text-success-600" />
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Email Enviado!
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                Se existir uma conta com o email <strong className="text-primary-700">{email}</strong>, você receberá instruções para redefinir sua senha.
              </p>
              <div className="bg-bronze-50 border-2 border-bronze-300 rounded-xl p-5 mb-8">
                <p className="text-base text-bronze-800 font-medium">
                  <strong>Importante:</strong> Verifique também sua caixa de spam. O link expira em 1 hora.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-bronze-700 to-bronze-800 hover:from-bronze-600 hover:to-bronze-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <ArrowLeft className="h-6 w-6 mr-3" />
                Voltar para Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-10">
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">Esqueceu sua senha?</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Digite seu email e enviaremos instruções para redefinir sua senha.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-50 border-2 border-error-300 text-error-700 px-5 py-4 rounded-xl text-base font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all text-base"
                  placeholder="Digite seu e-mail"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-5 px-6 border border-transparent rounded-xl shadow-xl text-lg font-bold text-white bg-gradient-to-r from-bronze-700 to-bronze-800 hover:from-bronze-600 hover:to-bronze-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bronze-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 hover:shadow-2xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-6 w-6 mr-3" />
                  Enviar Instruções
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <Link
              to="/login"
              className="flex items-center justify-center text-base text-primary-700 hover:text-primary-800 font-semibold"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar para Login
            </Link>
            <p className="text-base text-neutral-600 dark:text-neutral-400">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-bold text-primary-700 hover:text-primary-800">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
