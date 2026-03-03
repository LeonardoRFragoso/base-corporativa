/**
 * Componente Skeleton para loading states
 * Melhora a percepção de velocidade do usuário
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
  circle = false
}) {
  
  const baseStyles = 'animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-700 bg-[length:200%_100%]';
  
  const variants = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    button: 'h-10 rounded-xl',
    card: 'h-64 rounded-2xl',
    avatar: 'w-12 h-12 rounded-full',
    image: 'aspect-square rounded-xl'
  };
  
  const variantClass = variants[variant] || variants.text;
  const circleClass = circle ? 'rounded-full' : '';
  const widthStyle = width ? { width } : {};
  const heightStyle = height ? { height } : {};
  
  const skeletonClass = `
    ${baseStyles}
    ${variantClass}
    ${circleClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={skeletonClass}
            style={{ ...widthStyle, ...heightStyle }}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div
      className={skeletonClass}
      style={{ ...widthStyle, ...heightStyle }}
    />
  );
}

/**
 * Skeleton para ProductCard
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
      <Skeleton variant="image" />
      <div className="p-4 space-y-3">
        <Skeleton width="60%" />
        <Skeleton variant="title" width="80%" />
        <Skeleton width="40%" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

/**
 * Skeleton para lista de produtos
 */
export function ProductListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
