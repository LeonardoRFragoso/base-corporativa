import { forwardRef } from 'react';

/**
 * Componente Input moderno e reutilizável
 * Suporta labels, erros, ícones e diferentes variantes
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  
  const baseStyles = 'px-4 py-2.5 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400'
    : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-600 dark:focus:border-primary-400';
  
  const bgStyles = 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100';
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const inputClassName = `
    ${baseStyles}
    ${stateStyles}
    ${bgStyles}
    ${leftIcon ? 'pl-11' : ''}
    ${rightIcon ? 'pr-11' : ''}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClassName}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 animate-slide-down">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
