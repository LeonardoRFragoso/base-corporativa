import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage.jsx';

/**
 * Categorias em Destaque com Imagens
 * Grid visual para navegação rápida
 */
export default function FeaturedCategories() {
  const categories = [
    {
      id: 1,
      name: 'Camisas Polo',
      slug: 'camisas-polo',
      description: 'Conforto e elegância',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop',
      productsCount: 24,
      color: 'from-primary-600/90 to-primary-800/90'
    },
    {
      id: 2,
      name: 'Calças Sociais',
      slug: 'calcas-sociais',
      description: 'Alfaiataria impecável',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
      productsCount: 18,
      color: 'from-bronze-700/90 to-bronze-900/90'
    },
    {
      id: 3,
      name: 'Blazers',
      slug: 'blazers',
      description: 'Sofisticação profissional',
      image: 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=600&h=800&fit=crop',
      productsCount: 15,
      color: 'from-neutral-700/90 to-neutral-900/90'
    },
    {
      id: 4,
      name: 'Acessórios',
      slug: 'acessorios',
      description: 'Complete seu look',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop',
      productsCount: 32,
      color: 'from-primary-600/90 to-bronze-700/90'
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-3 uppercase tracking-widest">
            Explore por Categoria
          </p>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Encontre o que Procura
          </h2>
          
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Navegue por nossas categorias e descubra peças essenciais para seu guarda-roupa corporativo
          </p>
        </div>

        {/* Grid de Categorias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* CTA Ver Todas */}
        <div className="text-center mt-12">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold text-lg transition-colors group"
          >
            Ver Todas as Categorias
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Card individual de categoria
 */
function CategoryCard({ category, index }) {
  return (
    <Link
      to={`/catalog?category=${category.slug}`}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Imagem de Fundo */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={category.image}
          alt={category.name}
          width={400}
          height={533}
          className="transition-transform duration-700 group-hover:scale-110"
          objectFit="cover"
        />
      </div>

      {/* Overlay Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        {/* Count Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
          <span className="text-white font-bold text-sm">
            {category.productsCount} produtos
          </span>
        </div>

        {/* Category Info */}
        <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
            {category.name}
          </h3>
          
          <p className="text-white/90 text-sm sm:text-base mb-4">
            {category.description}
          </p>

          {/* CTA Arrow */}
          <div className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
            <span>Ver produtos</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Decorative Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-50 transition-opacity"></div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
    </Link>
  );
}
