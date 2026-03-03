/**
 * Componente Card moderno e reutilizável
 * Suporta diferentes variantes e interações
 */
export default function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
  onClick,
  ...props
}) {
  
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
    elevated: 'bg-white dark:bg-neutral-800 shadow-lg',
    glass: 'bg-white/70 dark:bg-neutral-800/70 backdrop-blur-lg border border-white/20 dark:border-neutral-700/20',
    gradient: 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-800 dark:to-neutral-900',
    outline: 'border-2 border-primary-600 dark:border-primary-400'
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const hoverStyles = hover
    ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
    : '';
  
  const clickableStyles = onClick ? 'cursor-pointer' : '';
  
  const combinedClassName = `
    ${baseStyles}
    ${variants[variant] || variants.default}
    ${paddings[padding] || paddings.md}
    ${hoverStyles}
    ${clickableStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div
      className={combinedClassName}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Title
 */
export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-bold text-neutral-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

/**
 * Card Description
 */
export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-neutral-600 dark:text-neutral-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

/**
 * Card Content
 */
export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/**
 * Card Footer
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 ${className}`}>
      {children}
    </div>
  );
}
