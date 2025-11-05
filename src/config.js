const API_BASE_URL = 'http://localhost:8000'
const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  MOVIES: `${API_BASE_URL}/api/movies`,
  MOVIES_POPULAR: `${API_BASE_URL}/api/movies/popular`,
  MOVIES_SEARCH: `${API_BASE_URL}/api/movies/search`,
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  USER: `${API_BASE_URL}/api/user`,
  EDIT_USER: `${API_BASE_URL}/api/profile`,
  LOGOUT: `${API_BASE_URL}/api/logout`
}

const STORAGE_URLS = {
  POSTERS: `${API_BASE_URL}/storage/posters`,
  IMAGES: `${API_BASE_URL}/storage/images`,
  MOVIES: `${API_BASE_URL}/storage/images/movies`,
  NO_PHOTO: `${API_BASE_URL}/storage/images/movies/no-photo.png`
}

export { API_BASE_URL, API_ENDPOINTS, STORAGE_URLS }