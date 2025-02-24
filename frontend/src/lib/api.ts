import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const auth = {
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login/', data),
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register/', data),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/me/'),
}

// Listings endpoints
export const listings = {
  getAll: (params?: any) => 
    api.get('/listings/', { params }),
  get: (id: string) => 
    api.get(`/listings/${id}/`),
  create: (data: any) => 
    api.post('/listings/', data),
  update: (id: string, data: any) => 
    api.put(`/listings/${id}/`, data),
  delete: (id: string) => 
    api.delete(`/listings/${id}/`),
}

// User profile endpoints
export const profile = {
  get: () => 
    api.get('/profile/'),
  update: (data: any) => 
    api.put('/profile/', data),
  updateAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.put('/profile/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
