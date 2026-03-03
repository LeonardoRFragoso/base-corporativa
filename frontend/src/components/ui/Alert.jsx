import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

/**
 * Componente Alert moderno para notificações e mensagens
 */
export default function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = ''
}) {
  
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      icon: <CheckCircle className="text-green-600 dark:text-green-400" size={20} />,
      title: 'text-green-800 dark:text-green-300',
      text: 'text-green-700 dark:text-green-400'
    },
    error: {
      container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      icon: <XCircle className="text-red-600 dark:text-red-400" size={20} />,
      title: 'text-red-800 dark:text-red-300',
      text: 'text-red-700 dark:text-red-400'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      icon: <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />,
      title: 'text-yellow-800 dark:text-yellow-300',
      text: 'text-yellow-700 dark:text-yellow-400'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      icon: <Info className="text-blue-600 dark:text-blue-400" size={20} />,
      title: 'text-blue-800 dark:text-blue-300',
      text: 'text-blue-700 dark:text-blue-400'
    }
  };
  
  const currentVariant = variants[variant] || variants.info;
  
  return (
    <div className={`
      relative rounded-xl border p-4 animate-slide-down
      ${currentVariant.container}
      ${className}
    `}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {currentVariant.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-semibold mb-1 ${currentVariant.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${currentVariant.text}`}>
            {children}
          </div>
        </div>
        
        {dismissible && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${currentVariant.text}`}
            aria-label="Fechar alerta"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
