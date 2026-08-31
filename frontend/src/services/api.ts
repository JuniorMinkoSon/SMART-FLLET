import axios from 'axios'

const API_BASE_URL = 'http://localhost:9090/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// AUTH
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

// USERS
export const usersAPI = {
  create: (data: any) => api.post('/users', data),
  list: () => api.get('/users'),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
}

// DRIVERS
export const driversAPI = {
  create: (data: any) => api.post('/drivers', data),
  list: () => api.get('/drivers'),
  get: (id: string) => api.get(`/drivers/${id}`),
  update: (id: string, data: any) => api.put(`/drivers/${id}`, data),
  delete: (id: string) => api.delete(`/drivers/${id}`),
  available: () => api.get('/drivers/available'),
}

// VEHICLES
export const vehiclesAPI = {
  create: (data: any) => api.post('/vehicles', data),
  list: () => api.get('/vehicles'),
  get: (id: string) => api.get(`/vehicles/${id}`),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  available: () => api.get('/vehicles/available'),
}

// MISSIONS
export const missionsAPI = {
  create: (data: any) => api.post('/missions', data),
  list: () => api.get('/missions'),
  get: (id: string) => api.get(`/missions/${id}`),
  update: (id: string, data: any) => api.put(`/missions/${id}`, data),
  getMy: () => api.get('/missions/me'),
  assign: (id: string, driverId: string) =>
    api.post(`/missions/${id}/assign-driver/${driverId}`),
  start: (id: string) => api.post(`/missions/${id}/start`),
  return: (id: string) => api.post(`/missions/${id}/return`),
  validate: (id: string) => api.post(`/missions/${id}/validate`),
}

// FUEL
export const fuelAPI = {
  create: (data: any) => api.post('/fuel-entries', data),
  list: () => api.get('/fuel-entries'),
  get: (id: string) => api.get(`/fuel-entries/${id}`),
}

// DASHBOARD
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
}

export default api
