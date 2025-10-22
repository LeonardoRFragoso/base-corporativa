import { Link } from 'react-router-dom'
import logo from '../assets/img/LOGO-BASE-CORPORATIVA.png'

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-950 via-dark-900 to-bronze-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-gold-400/20 transform rotate-45"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-bronze-400/20 transform rotate-12"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img src={logo} alt="BASE CORPORATIVA" className="h-24 w-auto" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Sobre a BASE CORPORATIVA
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Conforto e praticidade diária para o profissional moderno que valoriza qualidade, 
              elegância e funcionalidade em cada peça do seu guarda-roupa.
            </p>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 mb-6">
                Nossa História
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                A BASE CORPORATIVA nasceu da necessidade de oferecer ao mercado brasileiro 
                roupas profissionais que combinam <strong>qualidade premium</strong>, 
                <strong>design minimalista</strong> e <strong>preços justos</strong>.
              </p>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Desenvolvemos cada peça pensando no profissional moderno que valoriza 
                qualidade, conforto e praticidade no dia a dia, sem comprometer com o 
                seu guarda-roupa de lifestyle.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Nosso compromisso é democratizar o acesso a roupas corporativas de alta 
                qualidade, para que todos os profissionais possam se vestir com elegância 
                e confiança.
              </p>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="bg-gradient-to-br from-gold-50 to-bronze-50 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div className="bg-white rounded-xl p-6 shadow-soft">
                    <div className="text-3xl font-bold text-gold-600 mb-2">1000+</div>
                    <div className="text-sm text-neutral-600">Profissionais atendidos</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-soft">
                    <div className="text-3xl font-bold text-bronze-600 mb-2">95%</div>
                    <div className="text-sm text-neutral-600">Satisfação dos clientes</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-soft">
                    <div className="text-3xl font-bold text-gold-600 mb-2">50+</div>
                    <div className="text-sm text-neutral-600">Modelos disponíveis</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-soft">
                    <div className="text-3xl font-bold text-bronze-600 mb-2">24h</div>
                    <div className="text-sm text-neutral-600">Suporte especializado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 via-white to-gold-50/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 mb-4">
              Nossos Valores
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Os princípios que guiam cada decisão e cada peça que criamos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="w-16 h-16 bg-gradient-to-r from-gold-500 to-bronze-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-4">Qualidade</h3>
              <p className="text-neutral-600 leading-relaxed">
                Materiais duráveis e confortáveis, selecionados especialmente para resistir 
                ao uso diário mantendo a elegância e o conforto.
              </p>
            </div>
            
            <div className="text-center group animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-gradient-to-r from-bronze-500 to-gold-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-4">Design</h3>
              <p className="text-neutral-600 leading-relaxed">
                Peças atemporais com design clean e sofisticado, que combinam perfeitamente 
                entre si criando looks versáteis e elegantes.
              </p>
            </div>
            
            <div className="text-center group animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="w-16 h-16 bg-gradient-to-r from-gold-600 to-bronze-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-4">Acessibilidade</h3>
              <p className="text-neutral-600 leading-relaxed">
                Qualidade premium a preços acessíveis. Acreditamos que roupas de trabalho 
                de qualidade devem estar ao alcance de todos os profissionais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-dark-950 via-dark-900 to-bronze-900 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Pronto para conhecer nossa coleção?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Descubra como a BASE CORPORATIVA pode transformar seu guarda-roupa profissional
          </p>
          
          <Link 
            to="/catalog"
            className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-gold-500 to-bronze-500 text-dark-950 font-bold rounded-xl hover:from-gold-400 hover:to-bronze-400 transition-all duration-300 shadow-strong hover:shadow-xl transform hover:-translate-y-1"
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
