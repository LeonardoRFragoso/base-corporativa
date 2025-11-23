import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'

/**
 * Banner Hero para página de Catálogo
 */
export default function CatalogHeroBanner() {
  return (
    <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-bronze-700 text-white rounded-2xl overflow-hidden mb-8 shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative px-8 py-12 md:py-16">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">Promoção Exclusiva</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
            Encontre a Camisa Perfeita<br />
            para Seu Estilo Profissional
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
            Camisas premium com <strong>30% OFF</strong> neste mês. Design minimalista, 
            tecidos de qualidade e entrega rápida para todo Brasil.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/catalog?category=oversized"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-neutral-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Ver Coleção Oversized
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/catalog?category=premium"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-bronze-800 hover:bg-bronze-900 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Linha Premium
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-8 pt-8 border-t border-white/20 flex flex-wrap gap-8">
            <div>
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-sm text-white/80">Modelos Disponíveis</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">30% OFF</div>
              <div className="text-sm text-white/80">Em Toda Loja</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">Frete Grátis</div>
              <div className="text-sm text-white/80">Acima de R$ 200</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mb-32"></div>
    </div>
  )
}
