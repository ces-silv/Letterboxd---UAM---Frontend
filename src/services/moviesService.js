import api from './apiClient'
import { API_ENDPOINTS } from '../config'

const list = (params = {}) => api.get(API_ENDPOINTS.MOVIES, { params })
const popular = (params = {}) => api.get(API_ENDPOINTS.MOVIES_POPULAR, { params })
const search = (params = {}) => api.get(API_ENDPOINTS.MOVIES_SEARCH, { params })
const getById = (id, params = {}) => api.get(`${API_ENDPOINTS.MOVIES}/${id}`, { params })
const stats = (id) => api.get(`${API_ENDPOINTS.MOVIES}/${id}/statistics`)
const reviewsForMovie = (id, params = {}) => api.get(`${API_ENDPOINTS.MOVIES}/${id}/reviews`, { params })

export default { list, popular, search, getById, stats, reviewsForMovie }