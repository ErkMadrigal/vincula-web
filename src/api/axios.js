import axios from 'axios'

const api = axios.create({
  // baseURL: 'http://localhost/vincula-api/public/api',
  baseURL: 'https://api.vincula365.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Escuela elegida en el selector (admin / super admin). El backend valida el acceso.
  const escuela = localStorage.getItem('escuelaActiva')
  if (escuela) {
    config.headers['X-Escuela-Id'] = escuela
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      localStorage.removeItem('escuelaActiva')
      window.location.href = '/login'
    }
    // Le quitaron el acceso a la escuela elegida: olvidarla y volver a cargar
    if (
      error.response?.status === 403 &&
      error.response?.data?.messages?.error === 'No tienes acceso a esa escuela.'
    ) {
      localStorage.removeItem('escuelaActiva')
      window.location.reload()
    }
    return Promise.reject(error)
  },
)

export default api
