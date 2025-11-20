import api from './apiClient'
import { API_ENDPOINTS } from '../config'

const create = (data) => api.post(API_ENDPOINTS.REVIEWS, data)
const update = (id, data) => api.put(`${API_ENDPOINTS.REVIEWS}/${id}`, data)
const remove = (id) => api.delete(`${API_ENDPOINTS.REVIEWS}/${id}`)
const myReviews = (params = {}) => api.get(API_ENDPOINTS.REVIEWS_MY, { params })
const reviewStatus = (movieId) => api.get(API_ENDPOINTS.MOVIE_REVIEW_STATUS(movieId))

export default { create, update, remove, myReviews, reviewStatus }