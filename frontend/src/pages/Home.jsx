import { Link } from 'react-router-dom'
import logo from '../assets/img/LOGO-BASE-CORPORATIVA.png'
import SEO from '../components/SEO.jsx'
import { OrganizationSchema, WebsiteSchema } from '../components/StructuredData.jsx'

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
      <SEO 
        title="BASE CORPORATIVA - Roupas Corporativas de Qualidade Premium"
        description="Roupas corporativas minimalistas e de alta qualidade. Conforto e praticidade para o profissional moderno. Frete grátis acima de R$ 200. Mais de 1.000 profissionais já escolheram a BASE CORPORATIVA."
        keywords="roupas corporativas, uniformes profissionais, camisas polo masculinas, calças sociais, roupas de trabalho, moda corporativa, uniformes empresariais, roupas minimalistas"
        url="/"
      />
      <OrganizationSchema />
      <WebsiteSchema />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 text-white overflow-hidden transition-colors duration-300">
        {/* Overlay decorativo melhorado */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/5 via-transparent to-bronze-900/5 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/5 to-bronze-600/10"></div>
        
        {/* Geometric Pattern Background */}
        <div className="hidden md:block absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary-400/30 transform rotate-45 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-bronze-600/30 transform rotate-12 animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/3 w-20 h-20 border-2 border-primary-500/30 transform -rotate-12 animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-bronze-700/30 transform rotate-45 animate-pulse" style={{animationDuration: '5s', animationDelay: '0.5s'}}></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in-down">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-1.414 1.414l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Mais de 1.000 profissionais confiam
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-black mb-6 leading-tight tracking-tight animate-fade-in-up">
                BASE<br className="md:hidden" /> CORPORATIVA
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary-200 mb-6 font-light tracking-wide">
                Conforto e praticidade diária
              </p>
              <p className="text-sm sm:text-base md:text-lg text-neutral-200 mb-8 sm:mb-10 leading-relaxed max-w-xl">
                Roupas minimalistas, monocromáticas e de alta qualidade dedicadas ao trabalho, 
                sem competir com o seu guarda-roupa de lifestyle.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Link 
                  to="/catalog"
                  className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-bronze-600 to-bronze-700 text-white font-bold text-lg rounded-xl hover:from-bronze-500 hover:to-bronze-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 overflow-hidden animate-fade-in-up" style={{animationDelay: '0.4s'}}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  <span className="relative">
                    Ver catálogo
                  </span>
                  <svg className="ml-3 h-6 w-6 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link 
                  to="/about"
                  className="inline-flex items-center px-10 py-5 border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm transform hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.6s'}}
                >
                  Sobre nós
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end animate-scale-in">
              <div className="relative animate-float">
                {/* Glow effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 to-bronze-600/30 rounded-full blur-3xl scale-150 animate-glow-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400/15 to-bronze-500/15 rounded-full blur-2xl scale-125"></div>
                
                {/* Logo container with enhanced styling */}
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-10 border-2 border-white/20 hover:border-primary-400/40 transition-all duration-500 hover:scale-105 shadow-2xl">
                  <img 
                    src={logo} 
                    alt="BASE CORPORATIVA" 
                    className="h-56 sm:h-72 lg:h-80 w-auto object-contain drop-shadow-2xl filter brightness-110 contrast-110"
                  />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-10 h-10 border-2 border-primary-400/40 rounded-full animate-pulse shadow-lg"></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 border-2 border-bronze-600/40 rounded-full animate-pulse shadow-lg" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4 sm:mb-6 transition-colors duration-300">
              Por que escolher a BASE CORPORATIVA?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed px-4 transition-colors duration-300">
              Desenvolvemos cada peça pensando no profissional moderno que valoriza qualidade, 
              conforto e praticidade no dia a dia.
            </p>
          </div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Linha conectora entre os cards */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-200 dark:via-primary-800 to-transparent -z-10 transform -translate-y-1/2"></div>
            <div className="group bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl dark:shadow-neutral-900/80 hover:shadow-2xl dark:hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-2 border-2 border-primary-600/30 dark:border-primary-500/50 hover:border-primary-500 dark:hover:border-primary-400 relative overflow-hidden text-center ring-2 ring-transparent hover:ring-primary-500/30 dark:hover:ring-primary-400/30">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-transparent to-bronze-500/0 group-hover:from-primary-500/10 group-hover:to-bronze-500/5 transition-all duration-500 pointer-events-none"></div>
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-primary-500/15 dark:text-primary-400/20 font-bold text-5xl sm:text-6xl font-display group-hover:text-primary-500/25 dark:group-hover:text-primary-400/30 transition-all duration-300">01</div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10 shadow-xl dark:shadow-primary-500/40 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 relative z-10">Tecidos de qualidade</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base">
                Materiais duráveis e confortáveis, selecionados especialmente para resistir ao uso diário 
                mantendo a elegância e o conforto.
              </p>
            </div>

            <div className="group bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl dark:shadow-neutral-900/80 hover:shadow-2xl dark:hover:shadow-bronze-500/20 transition-all duration-500 hover:-translate-y-2 border-2 border-bronze-700/30 dark:border-bronze-600/50 hover:border-bronze-600 dark:hover:border-bronze-500 relative overflow-hidden text-center ring-2 ring-transparent hover:ring-bronze-500/30 dark:hover:ring-bronze-400/30">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-br from-bronze-500/0 via-transparent to-bronze-500/0 group-hover:from-bronze-500/10 group-hover:to-bronze-500/5 transition-all duration-500 pointer-events-none"></div>
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-bronze-700/15 dark:text-bronze-500/20 font-bold text-5xl sm:text-6xl font-display group-hover:text-bronze-700/25 dark:group-hover:text-bronze-500/30 transition-all duration-300">02</div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-bronze-700 to-bronze-800 dark:from-bronze-600 dark:to-bronze-700 rounded-xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10 shadow-lg dark:shadow-bronze-500/30 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 relative z-10">Design minimalista</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base">
                Peças atemporais com design clean e sofisticado, que combinam perfeitamente entre si 
                criando looks versáteis e elegantes.
              </p>
            </div>

            <div className="group bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl dark:shadow-neutral-900/80 hover:shadow-2xl dark:hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-2 border-2 border-primary-600/30 dark:border-primary-500/50 hover:border-primary-500 dark:hover:border-primary-400 relative overflow-hidden text-center ring-2 ring-transparent hover:ring-primary-500/30 dark:hover:ring-primary-400/30">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-transparent to-bronze-500/0 group-hover:from-primary-500/10 group-hover:to-bronze-500/5 transition-all duration-500 pointer-events-none"></div>
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-primary-600/15 dark:text-primary-400/20 font-bold text-5xl sm:text-6xl font-display group-hover:text-primary-600/25 dark:group-hover:text-primary-400/30 transition-all duration-300">03</div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10 shadow-xl dark:shadow-primary-500/40 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 relative z-10">Preço justo</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base">
                Qualidade premium a preços acessíveis. Acreditamos que roupas de trabalho de qualidade 
                devem estar ao alcance de todos os profissionais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-primary-50/30 via-white to-bronze-50/20 dark:from-neutral-800/50 dark:via-neutral-900 dark:to-neutral-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-soft-pulse">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              Frete Grátis acima de R$ 200
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-600 to-bronze-700 dark:from-primary-500 dark:to-bronze-600 rounded-full mb-4 sm:mb-6 shadow-xl transition-colors duration-300">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-400 mb-3 sm:mb-4 tracking-widest uppercase transition-colors duration-300">CONFIANÇA PROFISSIONAL</p>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4 sm:mb-6 leading-tight px-4 transition-colors duration-300">Mais de 1.000 profissionais já escolheram a BASE CORPORATIVA</h3>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed px-4 transition-colors duration-300">Junte-se aos profissionais que já descobriram a diferença de vestir qualidade premium todos os dias.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="group bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg dark:shadow-neutral-900/50 hover:shadow-2xl dark:hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-2 border-2 border-primary-600 animate-fade-in text-center ring-1 ring-neutral-200 dark:ring-neutral-700 hover:ring-primary-500/30" style={{animationDelay: '0.1s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl dark:shadow-primary-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Frete Grátis</div>
              <p className="text-neutral-600 dark:text-neutral-300 text-base leading-relaxed">Acima de R$ 200</p>
            </div>
            
            <div className="group bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg dark:shadow-neutral-900/50 hover:shadow-2xl dark:hover:shadow-bronze-500/20 transition-all duration-500 hover:-translate-y-2 border-2 border-bronze-700/40 dark:border-bronze-600/50 hover:border-bronze-600 dark:hover:border-bronze-500 animate-fade-in text-center ring-1 ring-neutral-200 dark:ring-neutral-700 hover:ring-bronze-500/30" style={{animationDelay: '0.2s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-bronze-700 to-bronze-800 dark:from-bronze-600 dark:to-bronze-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl dark:shadow-bronze-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Garantia</div>
              <p className="text-neutral-600 dark:text-neutral-300 text-base leading-relaxed">30 dias para troca</p>
            </div>
            
            <div className="group bg-white dark:bg-neutral-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-t-4 border-primary-600 animate-fade-in text-center" style={{animationDelay: '0.3s'}}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 sm:mb-3">Segurança</div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">Compra protegida</div>
            </div>
            
            <div className="group bg-white dark:bg-neutral-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-t-4 border-bronze-800 animate-fade-in text-center" style={{animationDelay: '0.4s'}}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-bronze-800 to-bronze-900 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 sm:mb-3">Suporte</div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">Atendimento especializado</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24 lg:py-36 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 text-white overflow-hidden transition-colors duration-300">
        {/* Background overlays melhorados */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 via-transparent to-bronze-900/10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bronze-900/20 to-transparent"></div>
        
        {/* Background Pattern */}
        <div className="hidden md:block absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary-400/30 transform rotate-45 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-bronze-600/30 transform rotate-12 animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-primary-500/30 transform -rotate-12 animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-primary-100 to-bronze-200 bg-clip-text text-transparent leading-tight">
              Pronto para renovar seu guarda-roupa profissional?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-neutral-200 mb-10 sm:mb-14 max-w-4xl mx-auto leading-relaxed px-4">
              Descubra nossa coleção completa de roupas corporativas e encontre as peças perfeitas 
              para elevar seu estilo profissional a um novo patamar.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{animationDelay: '0.2s'}}>
            <Link 
              to="/catalog"
              className="group inline-flex items-center justify-center w-full sm:w-auto px-12 py-6 bg-gradient-to-r from-primary-600 to-bronze-700 hover:from-primary-500 hover:to-bronze-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-primary-500/50 dark:hover:shadow-primary-400/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              Explorar catálogo
              <svg className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <button onClick={handleDownloadCatalog} className="group inline-flex items-center justify-center w-full sm:w-auto px-12 py-6 border-2 border-neutral-600 dark:border-neutral-500 hover:border-primary-500 dark:hover:border-primary-400 text-neutral-200 dark:text-neutral-300 hover:text-white dark:hover:text-white hover:bg-neutral-800/50 dark:hover:bg-neutral-700/50 font-bold text-lg rounded-xl backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1">
              <svg className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Baixar catálogo PDF
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 sm:mt-16 lg:mt-20 flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-10 text-neutral-300 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center gap-2 sm:gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm sm:text-base font-semibold">Entrega garantida</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm sm:text-base font-semibold">Compra 100% segura</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm sm:text-base font-semibold">Satisfação garantida</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
