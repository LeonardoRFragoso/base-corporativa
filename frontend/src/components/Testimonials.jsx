import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

/**
 * Carrossel de Depoimentos com Fotos
 * Prova social visual com avatares de clientes
 */
export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = [
    {
      id: 1,
      name: "Carlos Mendes",
      role: "Gerente Comercial",
      company: "Tech Solutions LTDA",
      avatar: "https://ui-avatars.com/api/?name=Carlos+Mendes&background=d4a574&color=fff&size=200",
      rating: 5,
      text: "Roupas de excelente qualidade! Uso diariamente no trabalho e recebo elogios. O tecido é confortável e mantém a elegância o dia todo. Recomendo!"
    },
    {
      id: 2,
      name: "Ana Paula Silva",
      role: "Diretora de RH",
      company: "Corporativa Ltda",
      avatar: "https://ui-avatars.com/api/?name=Ana+Silva&background=5d2e0f&color=fff&size=200",
      rating: 5,
      text: "Compramos uniformes para toda nossa equipe. A BASE CORPORATIVA entregou qualidade premium com preço justo. Atendimento impecável!"
    },
    {
      id: 3,
      name: "Roberto Almeida",
      role: "Consultor Empresarial",
      company: "Independente",
      avatar: "https://ui-avatars.com/api/?name=Roberto+Almeida&background=d4a574&color=fff&size=200",
      rating: 5,
      text: "Finalmente encontrei roupas corporativas que aliam conforto e elegância. O design minimalista é perfeito para quem valoriza praticidade."
    },
    {
      id: 4,
      name: "Juliana Costa",
      role: "Coordenadora",
      company: "Grupo Empresarial",
      avatar: "https://ui-avatars.com/api/?name=Juliana+Costa&background=5d2e0f&color=fff&size=200",
      rating: 5,
      text: "A durabilidade dos produtos é impressionante. Depois de meses de uso diário, as peças continuam como novas. Vale cada centavo!"
    }
  ];

  // Auto-play
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-primary-50/30 via-white to-bronze-50/20 dark:from-neutral-800/50 dark:via-neutral-900 dark:to-neutral-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4 fill-current" />
            Avaliação 4.9/5.0
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            O Que Dizem Nossos Clientes
          </h2>
          
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Mais de 1.000 profissionais confiam na BASE CORPORATIVA para seu guarda-roupa profissional
          </p>
        </div>

        {/* Testimonial Card */}
        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
            {/* Quote Icon Background */}
            <div className="absolute top-8 right-8 opacity-5 dark:opacity-10">
              <Quote className="w-32 h-32 text-primary-600" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Stars Rating */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-center mb-8">
                <p className="text-lg sm:text-xl lg:text-2xl text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                  "{current.text}"
                </p>
              </blockquote>

              {/* Author Info */}
              <div className="flex flex-col items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-bronze-600 rounded-full blur-lg opacity-30"></div>
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="relative w-20 h-20 rounded-full border-4 border-white dark:border-neutral-700 shadow-xl"
                  />
                  {/* Verified Badge */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-800">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Info */}
                <div className="text-center">
                  <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {current.name}
                  </h4>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold">
                    {current.role}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {current.company}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 bg-white dark:bg-neutral-800 hover:bg-primary-600 dark:hover:bg-primary-600 text-neutral-600 dark:text-neutral-300 hover:text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 bg-white dark:bg-neutral-800 hover:bg-primary-600 dark:hover:bg-primary-600 text-neutral-600 dark:text-neutral-300 hover:text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-3 mt-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-3 bg-primary-600'
                  : 'w-3 h-3 bg-neutral-300 dark:bg-neutral-600 hover:bg-primary-400'
              }`}
              aria-label={`Ir para depoimento ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats Below */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              1.247
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 font-medium">
              Clientes Satisfeitos
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              4.9/5.0
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 font-medium">
              Avaliação Média
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              98%
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 font-medium">
              Taxa de Recompra
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
