import api from './apiClient'
import { API_ENDPOINTS } from '../config'

const createMovie = (data) => api.post(API_ENDPOINTS.MOVIES, data, { headers: { 'Content-Type': 'multipart/form-data' } })
const updateMovie = (id, data) => {
  const hasFile = data instanceof FormData
  if (hasFile) {
    // Prefer POST for multipart/form-data updates to ensure fields arrive correctly
    // Equivalent to Laravel-friendly update endpoint for file uploads
    return api.post(`${API_ENDPOINTS.MOVIES}/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
  return api.put(`${API_ENDPOINTS.MOVIES}/${id}`, data)
}

const deleteMovie = (id) => api.delete(`${API_ENDPOINTS.MOVIES}/${id}`)

const listActors = (params = {}) => api.get(API_ENDPOINTS.ACTORS, { params })
const createActor = (data) => api.post(API_ENDPOINTS.ACTORS, data)

const listDirectors = (params = {}) => api.get(API_ENDPOINTS.DIRECTORS, { params })
const createDirector = (data) => api.post(API_ENDPOINTS.DIRECTORS, data)
const deleteDirector = (id) => api.delete(`${API_ENDPOINTS.DIRECTORS}/${id}`)

const listGenres = (params = {}) => api.get(API_ENDPOINTS.GENRES, { params })
const createGenre = (data) => api.post(API_ENDPOINTS.GENRES, data)

const listCasts = (params = {}) => api.get(API_ENDPOINTS.MOVIE_CASTS, { params })
const createMovieCast = (data) => api.post(API_ENDPOINTS.MOVIE_CASTS, data)

export default { createMovie, updateMovie, deleteMovie, listActors, createActor, listDirectors, createDirector, deleteDirector, listGenres, createGenre, listCasts, createMovieCast }
