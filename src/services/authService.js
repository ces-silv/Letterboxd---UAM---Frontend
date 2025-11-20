import api from './apiClient'
import { API_ENDPOINTS } from '../config'

const login = (data) => api.post(API_ENDPOINTS.LOGIN, data)
const register = (data) => api.post(API_ENDPOINTS.REGISTER, data)
const logout = () => api.post(API_ENDPOINTS.LOGOUT)
const me = () => api.get(API_ENDPOINTS.USER)
const updateProfile = (data) => api.put(API_ENDPOINTS.EDIT_USER, data)
const changePassword = (data) => api.put(API_ENDPOINTS.CHANGE_PASSWORD, data)

export default { login, register, logout, me, updateProfile, changePassword }