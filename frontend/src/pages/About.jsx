import { Link } from 'react-router-dom'
import logo from '../assets/img/LOGO-BASE-CORPORATIVA.png'
import SEO from '../components/SEO.jsx'
import { BreadcrumbSchema } from '../components/StructuredData.jsx'

export default function About() {
  const breadcrumbItems = [
    { name: 'Início', url: '/' },
    { name: 'Sobre Nós', url: '/about' }
  ]

  return (
    <div className="min-h-screen">
      <SEO 
        title="Sobre Nós - BASE CORPORATIVA | Nossa História e Missão"
        description="Conheça a BASE CORPORATIVA: nossa missão de fornecer roupas corporativas de qualidade premium para profissionais modernos. Conforto, praticidade e elegância em cada peça."
        keywords="sobre base corporativa, história empresa, missão roupas corporativas, qualidade premium, profissionais modernos"
        url="/about"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
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
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-primary-100 to-bronze-200 bg-clip-text text-transparent drop-shadow-2xl">
                Sobre a BASE CORPORATIVA
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl text-primary-200 mb-6 font-light tracking-wide">
                Conforto e praticidade diária
              </p>
              <p className="text-base sm:text-lg text-neutral-200 mb-10 leading-relaxed max-w-xl">
                Conforto e praticidade diária para o profissional moderno que valoriza qualidade, 
                elegância e funcionalidade em cada peça do seu guarda-roupa.
              </p>
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

      {/* Nossa História */}
      <section className="py-28 bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-8">
                Nossa História
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                A BASE CORPORATIVA nasceu da necessidade de oferecer ao mercado brasileiro 
                roupas profissionais que combinam <strong className="text-primary-700 dark:text-primary-400">qualidade premium</strong>, 
                <strong className="text-bronze-700 dark:text-bronze-400">design minimalista</strong> e <strong className="text-primary-700 dark:text-primary-400">preços justos</strong>.
              </p>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                Desenvolvemos cada peça pensando no profissional moderno que valoriza 
                qualidade, conforto e praticidade no dia a dia, sem comprometer com o 
                seu guarda-roupa de lifestyle.
              </p>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Nosso compromisso é democratizar o acesso a roupas corporativas de alta 
                qualidade, para que todos os profissionais possam se vestir com elegância 
                e confiança.
              </p>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="bg-gradient-to-br from-primary-50/50 to-bronze-50/50 dark:from-neutral-800/50 dark:to-neutral-800/50 rounded-3xl p-10 transition-colors duration-300">
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg dark:shadow-neutral-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-neutral-200 dark:border-neutral-700">
                    <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-3">1000+</div>
                    <div className="text-base text-neutral-600 dark:text-neutral-400 font-medium">Profissionais atendidos</div>
                  </div>
                  <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg dark:shadow-neutral-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-neutral-200 dark:border-neutral-700">
                    <div className="text-5xl font-bold text-bronze-700 dark:text-bronze-400 mb-3">95%</div>
                    <div className="text-base text-neutral-600 dark:text-neutral-400 font-medium">Satisfação dos clientes</div>
                  </div>
                  <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg dark:shadow-neutral-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-neutral-200 dark:border-neutral-700">
                    <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-3">50+</div>
                    <div className="text-base text-neutral-600 dark:text-neutral-400 font-medium">Modelos disponíveis</div>
                  </div>
                  <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg dark:shadow-neutral-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-neutral-200 dark:border-neutral-700">
                    <div className="text-5xl font-bold text-bronze-700 dark:text-bronze-400 mb-3">24h</div>
                    <div className="text-base text-neutral-600 dark:text-neutral-400 font-medium">Suporte especializado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-28 bg-gradient-to-br from-primary-50/30 via-white to-bronze-50/20 dark:from-neutral-800/50 dark:via-neutral-900 dark:to-neutral-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              Nossos Valores
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
              Os princípios que guiam cada decisão e cada peça que criamos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group animate-fade-in bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-10 shadow-lg dark:shadow-neutral-900/50 hover:shadow-2xl dark:hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-2 border border-neutral-200 dark:border-neutral-700" style={{animationDelay: '0.1s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-5">Qualidade</h3>
              <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Materiais duráveis e confortáveis, selecionados especialmente para resistir 
                ao uso diário mantendo a elegância e o conforto.
              </p>
            </div>
            
            <div className="text-center group animate-fade-in bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-10 shadow-lg dark:shadow-neutral-900/50 hover:shadow-2xl dark:hover:shadow-bronze-500/20 transition-all duration-500 hover:-translate-y-2 border border-neutral-200 dark:border-neutral-700" style={{animationDelay: '0.2s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-bronze-700 to-bronze-800 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-5">Design</h3>
              <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Peças atemporais com design clean e sofisticado, que combinam perfeitamente 
                entre si criando looks versáteis e elegantes.
              </p>
            </div>
            
            <div className="text-center group animate-fade-in bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-10 shadow-lg dark:shadow-neutral-900/50 hover:shadow-2xl dark:hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-2 border border-neutral-200 dark:border-neutral-700" style={{animationDelay: '0.3s'}}>
              <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-5">Acessibilidade</h3>
              <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Qualidade premium a preços acessíveis. Acreditamos que roupas de trabalho 
                de qualidade devem estar ao alcance de todos os profissionais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-36 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 text-white overflow-hidden transition-colors duration-300">
        {/* Background overlays melhorados */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 via-transparent to-bronze-900/10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bronze-900/20 to-transparent"></div>
        
        {/* Background Pattern */}
        <div className="hidden md:block absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary-400/30 transform rotate-45 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-bronze-600/30 transform rotate-12 animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl lg:text-6xl font-display font-bold mb-8 bg-gradient-to-r from-white via-primary-100 to-bronze-200 bg-clip-text text-transparent">
            Pronto para conhecer nossa coleção?
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-200 mb-14 max-w-4xl mx-auto leading-relaxed">
            Descubra como a BASE CORPORATIVA pode transformar seu guarda-roupa profissional
          </p>
          
          <Link 
            to="/catalog"
            className="inline-flex items-center justify-center px-12 py-6 bg-gradient-to-r from-bronze-700 to-bronze-800 text-white font-bold text-lg rounded-xl hover:from-bronze-600 hover:to-bronze-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105"
          >
            Ver catálogo completo
            <svg className="ml-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
