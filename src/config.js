const API_BASE_URL = 'http://localhost:8000'
const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  MOVIES: `${API_BASE_URL}/api/movies`,
  MOVIES_POPULAR: `${API_BASE_URL}/api/movies/popular`,
  MOVIES_SEARCH: `${API_BASE_URL}/api/movies/search`,
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  REVIEWS_MY: `${API_BASE_URL}/api/reviews/my-reviews`,
  MOVIE_REVIEW_STATUS: (movieId) => `${API_BASE_URL}/api/movies/${movieId}/review-status`,
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  USER: `${API_BASE_URL}/api/user`,
  EDIT_USER: `${API_BASE_URL}/api/profile`,
  LOGOUT: `${API_BASE_URL}/api/logout`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/change-password`,
  ACTORS: `${API_BASE_URL}/api/actors`,
  DIRECTORS: `${API_BASE_URL}/api/directors`,
  GENRES: `${API_BASE_URL}/api/genres`,
  MOVIE_CASTS: `${API_BASE_URL}/api/movie-casts`
}

const STORAGE_URLS = {
  POSTERS: `${API_BASE_URL}/storage/posters`,
  IMAGES: `${API_BASE_URL}/storage/images`,
  MOVIES: `${API_BASE_URL}/storage/images/movies`,
  NO_PHOTO: `${API_BASE_URL}/storage/images/movies/no-photo.png`
}

export { API_BASE_URL, API_ENDPOINTS, STORAGE_URLS }