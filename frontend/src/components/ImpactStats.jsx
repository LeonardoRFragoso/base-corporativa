import { useEffect, useRef, useState } from 'react';
import { Users, Package, Star, TrendingUp } from 'lucide-react';

/**
 * Estatísticas com Counter Animado
 * Números sobem quando entram no viewport
 */
export default function ImpactStats() {
  const stats = [
    {
      id: 1,
      icon: Users,
      value: 1247,
      suffix: '+',
      label: 'Clientes Satisfeitos',
      color: 'from-primary-600 to-primary-700'
    },
    {
      id: 2,
      icon: Package,
      value: 5892,
      suffix: '',
      label: 'Pedidos Entregues',
      color: 'from-bronze-700 to-bronze-800'
    },
    {
      id: 3,
      icon: Star,
      value: 4.9,
      suffix: '/5.0',
      label: 'Avaliação Média',
      color: 'from-yellow-500 to-yellow-600',
      decimals: 1
    },
    {
      id: 4,
      icon: TrendingUp,
      value: 98,
      suffix: '%',
      label: 'Taxa de Recompra',
      color: 'from-green-600 to-green-700'
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-neutral-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-3 uppercase tracking-widest">
            Resultados que Falam
          </p>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Números que Impressionam
          </h2>
          
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            A confiança de milhares de profissionais refletida em números
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Card individual de estatística com counter animado
 */
function StatCard({ stat, index }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 segundos
    const steps = 60;
    const increment = stat.value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;

      if (step >= steps) {
        setCount(stat.value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, stat.value]);

  const Icon = stat.icon;
  const displayValue = stat.decimals 
    ? count.toFixed(stat.decimals)
    : Math.floor(count).toLocaleString('pt-BR');

  return (
    <div
      ref={cardRef}
      className="group bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-neutral-100 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Icon */}
      <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      {/* Number */}
      <div className="mb-3">
        <span className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-100">
          {displayValue}
        </span>
        <span className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
          {stat.suffix}
        </span>
      </div>

      {/* Label */}
      <p className="text-neutral-600 dark:text-neutral-400 font-medium text-lg">
        {stat.label}
      </p>

      {/* Decorative bar */}
      <div className="mt-6 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${stat.color} transform origin-left transition-transform duration-1000 ease-out`}
          style={{ 
            transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
            transitionDelay: `${index * 0.1}s`
          }}
        ></div>
      </div>
    </div>
  );
}
