import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

/**
 * Depoimentos Visuais para página About
 */
export default function TestimonialsAbout() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const testimonials = [
    {
      id: 1,
      name: 'Ana Paula Silva',
      role: 'Diretora de RH',
      company: 'TechCorp Brasil',
      avatar: 'AS',
      rating: 5,
      text: 'As camisas oversized são perfeitas! Confortáveis o dia todo e mantêm a elegância profissional. Já comprei 5 cores diferentes.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 2,
      name: 'Carlos Eduardo Mendes',
      role: 'Gerente Comercial',
      company: 'Consultoria Premium',
      avatar: 'CM',
      rating: 5,
      text: 'Qualidade excepcional! O tecido é macio, não amassa fácil e o caimento é impecável. Recomendo para todos os colegas.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 3,
      name: 'Juliana Costa',
      role: 'Advogada',
      company: 'Costa & Associados',
      avatar: 'JC',
      rating: 5,
      text: 'Atendimento impecável e entrega rápida. As camisas básicas são perfeitas para o escritório. Chegaram muito bem embaladas!',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 4,
      name: 'Roberto Almeida',
      role: 'Arquiteto',
      company: 'Studio RA',
      avatar: 'RA',
      rating: 5,
      text: 'Design minimalista que eu procurava! As camisas longline ficam ótimas e são super versáteis. Uso tanto no trabalho quanto no casual.',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 5,
      name: 'Fernanda Oliveira',
      role: 'Empresária',
      company: 'FO Investimentos',
      avatar: 'FO',
      rating: 5,
      text: 'Melhor custo-benefício! Comprei camisas premium e a qualidade supera marcas muito mais caras. Estou impressionada!',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToSlide = (index) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-28 bg-gradient-to-br from-primary-50 to-bronze-50/30 dark:from-neutral-800 dark:to-neutral-900 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Star className="w-4 h-4 fill-current" />
            Avaliação 4.9/5.0
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            O Que Dizem Nossos Clientes
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Mais de 1.000 profissionais confiam na BASE CORPORATIVA
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="relative">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-neutral-200 dark:border-neutral-700">
            {/* Quote Icon */}
            <div className="absolute top-8 right-8 opacity-10">
              <Quote className="w-24 h-24 text-primary-600" />
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 mb-6 relative z-10">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300 leading-relaxed mb-8 font-light italic relative z-10">
              "{currentTestimonial.text}"
            </blockquote>

            {/* Author Info */}
            <div className="flex items-center gap-4 relative z-10">
              {/* Avatar */}
              <div className={`w-16 h-16 bg-gradient-to-br ${currentTestimonial.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                {currentTestimonial.avatar}
              </div>

              {/* Details */}
              <div>
                <div className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                  {currentTestimonial.name}
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  {currentTestimonial.role}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-500">
                  {currentTestimonial.company}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 w-12 h-12 bg-white dark:bg-neutral-800 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform border border-neutral-200 dark:border-neutral-700"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 w-12 h-12 bg-white dark:bg-neutral-800 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform border border-neutral-200 dark:border-neutral-700"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-3 bg-primary-600 dark:bg-primary-400'
                  : 'w-3 h-3 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'
              }`}
              aria-label={`Ir para depoimento ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">1.247+</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Clientes Satisfeitos</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-bronze-600 dark:text-bronze-400 mb-2">4.9/5.0</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Avaliação Média</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">98%</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Taxa de Recompra</div>
          </div>
        </div>
      </div>
    </section>
  )
}
