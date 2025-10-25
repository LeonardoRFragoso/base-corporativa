import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { api } from '../lib/api.js'

const CartContext = createContext(null)

function reducer(state, action) {
  if (action.type === 'add') {
    const existing = state.items.find(
      (i) => i.id === action.item.id && i.variantId === action.item.variantId
    )
    if (existing) {
      return {
        ...state,
        items: state.items.map((i) =>
          i === existing ? { ...i, qty: i.qty + action.item.qty } : i
        ),
      }
    }
    return { ...state, items: [...state.items, action.item] }
  }
  if (action.type === 'remove') {
    return { ...state, items: state.items.filter((i) => i !== action.item) }
  }
  if (action.type === 'update') {
    return {
      ...state,
      items: state.items.map((i) =>
        i === action.item ? { ...i, qty: action.qty } : i
      ),
    }
  }
  if (action.type === 'clear') {
    return { ...state, items: [] }
  }
  return state
}

export function CartProvider({ children }) {
  const initialState = { items: [] }

  // Lazy init from localStorage so data survives page reloads
  function init(initial) {
    try {
      const raw = localStorage.getItem('cart_items')
      if (!raw) return initial
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return { items: parsed }
      if (parsed && Array.isArray(parsed.items)) return { items: parsed.items }
      return initial
    } catch {
      return initial
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState, init)

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(state.items))
    } catch {}
  }, [state.items])

  // Sync to backend cart on every change
  useEffect(() => {
    async function sync() {
      try {
        // Only sync if we have items to sync
        if (state.items.length === 0) return
        
        // Use single sync endpoint to avoid multiple simultaneous requests
        const items = state.items.map(it => ({
          variant_id: it.variantId,
          quantity: it.qty
        }))
        await api.post('/api/cart/sync/', { items })
      } catch (e) {
        // Silently ignore sync errors to not break UX
        console.debug('Cart sync skipped:', e.response?.status || e.message)
      }
    }
    sync()
  }, [state.items])
  const value = useMemo(
    () => ({ items: state.items, add: (item) => dispatch({ type: 'add', item }), remove: (item) => dispatch({ type: 'remove', item }), update: (item, qty) => dispatch({ type: 'update', item, qty }), clear: () => dispatch({ type: 'clear' }) }),
    [state.items]
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
