import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindflip-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
}

// Topics API
export const topicsAPI = {
  getAllTopics: () => api.get('/topics'),
  getTopicsByDomain: (domain) => api.get(`/topics/${encodeURIComponent(domain)}`),
  getTossQuestion: () => api.get('/topics/toss-question'),
}

// Debates API
export const debateAPI = {
  getDebates: () => api.get('/debates'),
  createDebate: (data) => api.post('/debates', data),
  getDebate: (id) => api.get(`/debates/${id}`),
  sendMessage: (id, data) => api.post(`/debates/${id}/message`, data),
  finishDebate: (id) => api.post(`/debates/${id}/finish`),
  startAITurn: (id) => api.post(`/debates/${id}/ai-opening`),
}

// Reports API
export const reportAPI = {
  getReport: (debateId) => api.get(`/debates/${debateId}/report`),
}
