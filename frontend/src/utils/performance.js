/**
 * Utilitários de performance para o e-commerce
 * Funções para otimizar carregamento e experiência do usuário
 */

/**
 * Debounce - Atrasa execução de função até que pare de ser chamada
 * Útil para search, resize, scroll
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle - Limita execução de função a uma vez por intervalo
 * Útil para scroll events, resize
 */
export function throttle(func, limit = 100) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Preload de imagens críticas
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload múltiplas imagens
 */
export async function preloadImages(urls) {
  const promises = urls.map(url => preloadImage(url));
  return Promise.allSettled(promises);
}

/**
 * Lazy load de componentes React
 */
export function lazyLoadComponent(importFunc, fallback = null) {
  const LazyComponent = React.lazy(importFunc);
  
  return function LazyWrapper(props) {
    return (
      <React.Suspense fallback={fallback || <div>Carregando...</div>}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
}

/**
 * Memoização simples para funções
 */
export function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Formatar preço com cache
 */
export const formatPrice = memoize((price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
});

/**
 * Otimizar scroll suave
 */
export function smoothScrollTo(element, offset = 0) {
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

/**
 * Verificar se elemento está visível no viewport
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Batch de atualizações do DOM
 */
export function batchDOMUpdates(updates) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Cache simples para API requests
 */
class APICache {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutos padrão
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    const age = Date.now() - item.timestamp;
    
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const age = Date.now() - item.timestamp;
    return age <= this.maxAge;
  }
}

export const apiCache = new APICache();

/**
 * Compressão de imagens no cliente antes de upload
 */
export async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
