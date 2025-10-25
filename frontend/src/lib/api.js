import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

let sessionKey = null
try {
  sessionKey = localStorage.getItem('session_key')
  if (!sessionKey) {
    const gen = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2))
    sessionKey = gen
    localStorage.setItem('session_key', sessionKey)
  }
} catch {}

export const api = axios.create({
  baseURL,
  headers: sessionKey ? { 'X-Session-Key': sessionKey } : undefined,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const refresh = localStorage.getItem('refresh_token')
      const originalRequest = error.config
      
      // Evitar loop infinito
      if (originalRequest._retry) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        return Promise.reject(error)
      }
      
      if (refresh) {
        originalRequest._retry = true
        try {
          const res = await axios.post(`${baseURL}/api/auth/refresh/`, { refresh })
          localStorage.setItem('access_token', res.data.access)
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`
          return api.request(originalRequest)
        } catch (refreshError) {
          // Token de refresh inválido, limpar tudo
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          
          // Se for uma requisição pública (GET), tentar novamente sem auth
          if (originalRequest.method?.toLowerCase() === 'get') {
            delete originalRequest.headers.Authorization
            originalRequest._retry = false
            return api.request(originalRequest)
          }
        }
      } else {
        // Sem refresh token, limpar access token inválido
        localStorage.removeItem('access_token')
        
        // Se for uma requisição pública (GET), tentar novamente sem auth
        if (originalRequest.method?.toLowerCase() === 'get') {
          delete originalRequest.headers.Authorization
          return api.request(originalRequest)
        }
      }
    }
    return Promise.reject(error)
  }
)
