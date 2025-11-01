import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs({ items }) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400 mb-6"
    >
      <Link 
        to="/" 
        className="flex items-center hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
        aria-label="Página inicial"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-neutral-400" aria-hidden="true" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className="text-neutral-900 dark:text-neutral-100 font-medium"
              aria-current="page"
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
