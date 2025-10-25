import { Link } from 'react-router-dom'
import logo from '../assets/img/LOGO-BASE-CORPORATIVA.png'

export default function Home() {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
  const catalogPdfUrl = import.meta.env.VITE_CATALOG_PDF_URL || `${baseURL}/media/catalog/catalogo.pdf`

  async function handleDownloadCatalog() {
    try {
      const res = await fetch(catalogPdfUrl)
      if (!res.ok) throw new Error('Arquivo não encontrado')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'catalogo-base-corporativa.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      window.open(catalogPdfUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-950 via-dark-900 to-bronze-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/10 to-bronze-500/10"></div>
        
        {/* Geometric Pattern Background */}
        <div className="hidden md:block absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-gold-400/20 transform rotate-45"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-bronze-400/20 transform rotate-12"></div>
          <div className="absolute bottom-32 left-1/3 w-20 h-20 border border-gold-400/20 transform -rotate-12"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border border-bronze-400/20 transform rotate-45"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
                BASE CORPORATIVA
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-4 font-light">
                Conforto e praticidade diária
              </p>
              <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-lg">
                Roupas minimalistas, monocromáticas e de alta qualidade dedicadas ao trabalho, 
                sem competir com o seu guarda-roupa de lifestyle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/catalog"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-400 hover:to-primary-500 transition-all duration-200 shadow-medium hover:shadow-strong transform hover:-translate-y-0.5"
                >
                  Ver catálogo
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link 
                  to="/about"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 border-2 border-primary-400/50 text-primary-300 font-semibold rounded-lg hover:bg-primary-500/10 hover:border-primary-300 transition-all duration-200"
                >
                  Sobre nós
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end animate-scale-in">
              <div className="relative animate-float">
                {/* Glow effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-bronze-500/20 rounded-full blur-3xl scale-150 animate-glow-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 to-bronze-400/10 rounded-full blur-2xl scale-125"></div>
                
                {/* Logo container with enhanced styling */}
                <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-primary-400/20 transition-all duration-500 hover:scale-105">
                  <img 
                    src={logo} 
                    alt="BASE CORPORATIVA" 
                    className="h-56 sm:h-72 lg:h-80 w-auto object-contain drop-shadow-2xl filter brightness-110"
                  />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 border-2 border-gold-400/30 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 border-2 border-bronze-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary-950 mb-4">
              Por que escolher a BASE CORPORATIVA?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Desenvolvemos cada peça pensando no profissional moderno que valoriza qualidade, 
              conforto e praticidade no dia a dia.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-t-4 border-primary-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-primary-500/20 font-bold text-4xl">01</div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-900 mb-3 relative z-10">Tecidos de qualidade</h3>
              <p className="text-neutral-600 leading-relaxed">
                Materiais duráveis e confortáveis, selecionados especialmente para resistir ao uso diário 
                mantendo a elegância e o conforto.
              </p>
            </div>

            <div className="group bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-t-4 border-bronze-700 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-bronze-700/20 font-bold text-4xl">02</div>
              <div className="w-12 h-12 bg-gradient-to-br from-bronze-700 to-bronze-800 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-900 mb-3 relative z-10">Design minimalista</h3>
              <p className="text-neutral-600 leading-relaxed">
                Peças atemporais com design clean e sofisticado, que combinam perfeitamente entre si 
                criando looks versáteis e elegantes.
              </p>
            </div>

            <div className="group bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-t-4 border-primary-600 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-primary-600/20 font-bold text-4xl">03</div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-900 mb-3 relative z-10">Preço justo</h3>
              <p className="text-neutral-600 leading-relaxed">
                Qualidade premium a preços acessíveis. Acreditamos que roupas de trabalho de qualidade 
                devem estar ao alcance de todos os profissionais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 via-white to-gold-50/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-primary-600 mb-3 tracking-wider uppercase">CONFIANÇA PROFISSIONAL</p>
            <h3 className="text-3xl lg:text-4xl font-display font-bold text-dark-900 mb-4">Mais de 1.000 profissionais já escolheram a BASE CORPORATIVA</h3>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Junte-se aos profissionais que já descobriram a diferença de vestir qualidade premium todos os dias.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="group bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-t-4 border-primary-500 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-dark-900 mb-2">Frete Grátis</div>
              <div className="text-neutral-600">Acima de R$ 200</div>
            </div>
            
            <div className="group bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-t-4 border-bronze-700 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="w-14 h-14 bg-gradient-to-r from-bronze-700 to-bronze-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-dark-900 mb-2">Garantia</div>
              <div className="text-neutral-600">30 dias para troca</div>
            </div>
            
            <div className="group bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-t-4 border-primary-600 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-dark-900 mb-2">Segurança</div>
              <div className="text-neutral-600">Compra protegida</div>
            </div>
            
            <div className="group bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-t-4 border-bronze-800 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="w-14 h-14 bg-gradient-to-r from-bronze-800 to-bronze-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-dark-900 mb-2">Suporte</div>
              <div className="text-neutral-600">Atendimento especializado</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-dark-950 via-dark-900 to-bronze-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="hidden md:block absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-gold-400/20 transform rotate-45"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-bronze-400/20 transform rotate-12"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-gold-400/20 transform -rotate-12"></div>
        </div>
        
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
              Pronto para renovar seu guarda-roupa profissional?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Descubra nossa coleção completa de roupas corporativas e encontre as peças perfeitas 
              para elevar seu estilo profissional a um novo patamar.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{animationDelay: '0.2s'}}>
            <Link 
              to="/catalog"
              className="group inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 bg-bronze-800 text-white font-bold rounded-xl hover:bg-bronze-700 transition-all duration-300 shadow-strong hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              Explorar catálogo
              <svg className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <button onClick={handleDownloadCatalog} className="group inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 border-2 border-primary-400/70 text-primary-300 font-bold rounded-xl hover:bg-primary-500/10 hover:border-primary-300 transition-all duration-300 backdrop-blur-sm">
              <svg className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Baixar catálogo PDF
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/60 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Entrega garantida</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Compra 100% segura</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Satisfação garantida</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
