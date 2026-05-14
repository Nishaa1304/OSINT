import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token && token !== 'mock-token') {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — auto logout (skip if using mock token or backend is offline)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { token } = useAuthStore.getState()
    if (err.response?.status === 401 && token && token !== 'mock-token') {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
