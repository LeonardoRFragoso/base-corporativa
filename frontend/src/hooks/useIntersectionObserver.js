import { useEffect, useRef, useState } from 'react';

/**
 * Hook para Intersection Observer - Lazy loading de imagens e componentes
 * Melhora significativamente a performance da página
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      
      // Uma vez que intersectou, mantém o estado
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
}
