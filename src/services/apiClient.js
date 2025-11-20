import axios from 'axios'
import { API_BASE_URL } from '../config'

const client = axios.create({ baseURL: API_BASE_URL })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

const get = (url, config = {}) => client.get(url, config)
const post = (url, data = {}, config = {}) => client.post(url, data, config)
const put = (url, data = {}, config = {}) => client.put(url, data, config)
const del = (url, config = {}) => client.delete(url, config)

export default { get, post, put, delete: del }