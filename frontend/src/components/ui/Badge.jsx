/**
 * Componente Badge moderno e reutilizável
 * Usado para status, tags, contadores, etc.
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
  ...props
}) {
  
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300';
  
  const variants = {
    default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    outline: 'border-2 border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };
  
  const pulseStyles = pulse ? 'animate-pulse' : '';
  
  const combinedClassName = `
    ${baseStyles}
    ${variants[variant] || variants.default}
    ${sizes[size] || sizes.md}
    ${pulseStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <span className={combinedClassName} {...props}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-green-600' :
          variant === 'error' ? 'bg-red-600' :
          variant === 'warning' ? 'bg-yellow-600' :
          variant === 'info' ? 'bg-blue-600' :
          variant === 'primary' ? 'bg-primary-600' :
          'bg-neutral-600'
        }`} />
      )}
      {children}
    </span>
  );
}
