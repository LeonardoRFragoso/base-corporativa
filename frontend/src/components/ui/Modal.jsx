import { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * Componente Modal moderno e acessível
 * Suporta diferentes tamanhos e animações
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };
  
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div
        className={`
          relative w-full ${sizes[size] || sizes.md} 
          bg-white dark:bg-neutral-800 
          rounded-2xl shadow-2xl 
          max-h-[90vh] overflow-hidden
          animate-scale-in
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
            {title && (
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Modal Header
 */
export function ModalHeader({ children, className = '' }) {
  return (
    <div className={`px-6 pt-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Modal Body
 */
export function ModalBody({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Modal Footer
 */
export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`px-6 pb-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
