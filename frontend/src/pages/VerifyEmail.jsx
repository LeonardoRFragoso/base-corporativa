import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

export default function VerifyEmail() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    if (token) {
      verifyEmail()
    }
  }, [token])

  async function verifyEmail() {
    try {
      const response = await api.post('/api/auth/verify-email/', { token })
      setStatus('success')
      setMessage(response.data.detail || 'Email verificado com sucesso!')
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email verificado! Faça login para continuar.' } })
      }, 3000)
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.error || 'Token inválido ou expirado. Por favor, solicite um novo email de verificação.')
    }
  }

  async function handleResendEmail(e) {
    e.preventDefault()
    if (!resendEmail.trim()) return

    setResending(true)
    setResendMessage('')

    try {
      const response = await api.post('/api/auth/resend-verification/', { email: resendEmail })
      setResendMessage({ type: 'success', text: response.data.detail })
      setResendEmail('')
    } catch (err) {
      setResendMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Erro ao reenviar email. Tente novamente.' 
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-soft p-8">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-bronze-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Verificando seu email...
              </h2>
              <p className="text-neutral-600">
                Por favor, aguarde enquanto confirmamos seu endereço de email.
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-success-100 p-3">
                  <CheckCircle className="h-16 w-16 text-success-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Email Verificado!
              </h2>
              <p className="text-neutral-600 mb-6">
                {message}
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
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-error-100 p-3">
                  <XCircle className="h-16 w-16 text-error-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Verificação Falhou
              </h2>
              <p className="text-neutral-600 mb-6">
                {message}
              </p>

              {/* Resend Email Form */}
              <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-bronze-600 mr-2" />
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Reenviar Email de Verificação
                  </h3>
                </div>
                
                <form onSubmit={handleResendEmail} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Digite seu email"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-bronze-600 focus:border-transparent"
                      required
                    />
                  </div>

                  {resendMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      resendMessage.type === 'success' 
                        ? 'bg-success-50 border border-success-200 text-success-800' 
                        : 'bg-error-50 border border-error-200 text-error-800'
                    }`}>
                      {resendMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-bronze-800 hover:bg-bronze-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5 mr-2" />
                        Reenviar Email
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full text-center px-6 py-3 border border-neutral-300 text-base font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
                >
                  Voltar para Login
                </Link>
                <Link
                  to="/"
                  className="block w-full text-center text-sm text-bronze-600 hover:text-bronze-700"
                >
                  Ir para Página Inicial
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
