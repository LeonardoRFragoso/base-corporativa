import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente Button moderno e reutilizável
 * Suporta múltiplas variantes, tamanhos e estados
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-md hover:shadow-lg active:scale-95',
    secondary: 'bg-neutral-800 hover:bg-neutral-900 text-white focus:ring-neutral-500 shadow-md hover:shadow-lg active:scale-95 dark:bg-neutral-700 dark:hover:bg-neutral-600',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20',
    ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md hover:shadow-lg active:scale-95',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-md hover:shadow-lg active:scale-95',
    link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500 dark:text-primary-400'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-base rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-lg rounded-xl gap-2.5',
    xl: 'px-8 py-4 text-xl rounded-2xl gap-3'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const combinedClassName = `
    ${baseStyles}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={combinedClassName}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
      {!loading && leftIcon && leftIcon}
      {children}
      {!loading && rightIcon && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
