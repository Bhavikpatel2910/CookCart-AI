import api from '../services/api.js'

const TOKEN_KEY = 'cookcart_token'
const USER_STORAGE_KEY = 'cookcart_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getCurrentUserFromStorage() {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setCurrentUserInStorage(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearCurrentUserStorage() {
  localStorage.removeItem(USER_STORAGE_KEY)
}

// Signs up a new user against the real backend and stores the JWT.
export async function signupRequest({ name, email, phone, password }) {
  const { data } = await api.post('/auth/signup', { name, email, phone, password })
  setToken(data.token)
  return data.user
}

// Logs a user in against the real backend and stores the JWT.
export async function loginRequest({ email, phone, password }) {
  const { data } = await api.post('/auth/login', { email, phone, password })
  setToken(data.token)
  return data.user
}

// Fetches the current user profile using the stored JWT (e.g. on page reload).
export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me')
  return data.user
}

export function logoutRequest() {
  clearToken()
  clearCurrentUserStorage()
}
