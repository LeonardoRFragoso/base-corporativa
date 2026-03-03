import { useState } from 'react';

/**
 * Componente Tabs moderno e acessível
 */
export default function Tabs({
  tabs,
  defaultTab = 0,
  onChange,
  variant = 'line',
  className = ''
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) onChange(index);
  };
  
  const variants = {
    line: {
      container: 'border-b border-neutral-200 dark:border-neutral-700',
      tab: 'px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors relative',
      activeTab: 'text-primary-600 dark:text-primary-400',
      indicator: 'absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400'
    },
    pills: {
      container: 'bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl',
      tab: 'px-4 py-2 font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all rounded-lg',
      activeTab: 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-md',
      indicator: ''
    },
    buttons: {
      container: 'flex gap-2',
      tab: 'px-4 py-2 font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all rounded-xl border border-neutral-300 dark:border-neutral-600',
      activeTab: 'bg-primary-600 text-white border-primary-600 shadow-md',
      indicator: ''
    }
  };
  
  const currentVariant = variants[variant] || variants.line;
  
  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={`flex ${currentVariant.container}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`
              ${currentVariant.tab}
              ${activeTab === index ? currentVariant.activeTab : ''}
            `}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {activeTab === index && variant === 'line' && (
              <span className={currentVariant.indicator} />
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
