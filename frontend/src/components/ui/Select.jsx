import { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Componente Select customizado e moderno
 */
const Select = forwardRef(({
  label,
  error,
  options = [],
  value,
  onChange,
  placeholder = 'Selecione...',
  fullWidth = false,
  className = '',
  disabled = false
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const selectRef = useRef(null);

  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    setSelectedOption(selected || null);
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: option.value } });
    }
  };

  const baseStyles = 'px-4 py-2.5 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-600';
  
  const bgStyles = 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            ${baseStyles}
            ${stateStyles}
            ${bgStyles}
            ${widthClass}
            ${className}
            flex items-center justify-between
          `}
        >
          <span className={selectedOption ? '' : 'text-neutral-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={20}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-60 overflow-auto animate-slide-down">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-full px-4 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors
                  flex items-center justify-between
                  ${selectedOption?.value === option.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}
                `}
              >
                <span>{option.label}</span>
                {selectedOption?.value === option.value && (
                  <Check size={18} className="text-primary-600 dark:text-primary-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 animate-slide-down">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
