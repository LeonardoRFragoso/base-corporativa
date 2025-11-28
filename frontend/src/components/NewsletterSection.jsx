import { useState } from 'react';
import { Mail, Check, AlertCircle, Gift, TrendingUp, Bell } from 'lucide-react';
import { api } from '../lib/api';

/**
 * Seção de Newsletter Otimizada
 * Com incentivo visual e validação em tempo real
 */
export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('Por favor, insira seu e-mail');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('E-mail inválido');
      return;
    }

    setStatus('loading');

    try {
      // Substituir pela sua API real
      await api.post('/api/newsletter/subscribe/', { email });
      
      setStatus('success');
      setMessage('Inscrição confirmada! Verifique seu e-mail.');
      setEmail('');

      // Reset após 5 segundos
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Erro ao se inscrever. Tente novamente.');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 4000);
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-bronze-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full animate-pulse" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-white rounded-full animate-pulse" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 border-2 border-white rounded-full animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6 animate-bounce" style={{animationDuration: '3s'}}>
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold mb-3 sm:mb-4">
            Ganhe <span className="text-yellow-300">10% OFF</span> na Primeira Compra!
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Cadastre-se em nossa newsletter e receba ofertas exclusivas, lançamentos e dicas de estilo profissional
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl text-neutral-900 font-medium text-base sm:text-lg placeholder:text-neutral-400 focus:ring-4 focus:ring-yellow-300 focus:outline-none shadow-xl"
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${
                status === 'loading'
                  ? 'bg-neutral-400 cursor-not-allowed'
                  : 'bg-yellow-400 text-neutral-900 hover:bg-yellow-300'
              }`}
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </span>
              ) : (
                'Quero 10% OFF'
              )}
            </button>
          </div>

          {/* Status Messages */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
              status === 'success'
                ? 'bg-green-500/20 border border-green-400'
                : 'bg-red-500/20 border border-red-400'
            }`}>
              {status === 'success' ? (
                <Check className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm sm:text-base font-medium">{message}</p>
            </div>
          )}
        </form>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">10% OFF</h4>
              <p className="text-xs sm:text-sm text-white/80">Primeira compra</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">Lançamentos</h4>
              <p className="text-xs sm:text-sm text-white/80">Em primeira mão</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">Ofertas</h4>
              <p className="text-xs sm:text-sm text-white/80">Exclusivas</p>
            </div>
          </div>
        </div>

        {/* Trust Note */}
        <p className="text-center text-sm text-white/70 mt-8">
          🔒 Seus dados estão seguros. Enviamos apenas conteúdo relevante. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
}
