import { createContext, useContext, useState, useEffect } from 'react'

const CompareContext = createContext()

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      const saved = localStorage.getItem('compare_items')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('compare_items', JSON.stringify(compareItems))
  }, [compareItems])

  const addToCompare = (product) => {
    if (compareItems.length >= 4) {
      return { success: false, message: 'Você pode comparar no máximo 4 produtos' }
    }
    if (compareItems.some(item => item.id === product.id)) {
      return { success: false, message: 'Produto já está na comparação' }
    }
    setCompareItems(prev => [...prev, product])
    return { success: true, message: 'Produto adicionado à comparação' }
  }

  const removeFromCompare = (productId) => {
    setCompareItems(prev => prev.filter(item => item.id !== productId))
  }

  const clearCompare = () => {
    setCompareItems([])
  }

  const isInCompare = (productId) => {
    return compareItems.some(item => item.id === productId)
  }

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare
    }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return context
}
