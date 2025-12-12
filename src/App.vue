<template>
  <div id="app">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo-link">
          <h1>Letterboxd UAM</h1>
        </router-link>
        <nav class="nav">
          <router-link to="/" class="nav-link">{{ $t('nav.home') }}</router-link>
          <router-link v-if="isAdmin" to="/admin" class="nav-link">{{ $t('nav.admin') || 'Admin' }}</router-link>
          <div class="user-menu">
            <button class="user-btn" @click="toggleUserMenu" aria-haspopup="true" aria-expanded="showUserMenu">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <div v-if="showUserMenu" class="dropdown">
              <template v-if="!isLoggedIn">
                <router-link to="/login" class="dropdown-item">{{ $t('nav.login') }}</router-link>
                <router-link to="/register" class="dropdown-item">{{ $t('nav.register') }}</router-link>
              </template>
              <template v-else>
                <router-link to="/profile" class="dropdown-item">{{ $t('nav.profile') }}</router-link>
                <button class="dropdown-item" @click="handleLogout">{{ $t('auth.logout') || 'Cerrar sesión' }}</button>
              </template>
            </div>
          </div>
          <div class="language-selector">
            <button @click="setLanguage('en')" :class="{ active: $i18n.locale === 'en' }" class="lang-btn">EN</button>
            <button @click="setLanguage('es')" :class="{ active: $i18n.locale === 'es' }" class="lang-btn">ES</button>
          </div>
        </nav>
      </div>
    </header>

    <router-view v-if="$route.path !== '/'" />

    <main v-else class="main-content">
      <div v-if="loading" class="loading">
        <div class="loading-bar-container">
          <div class="loading-bar"></div>
        </div>
        <p class="loading-text">{{ $t('common.loading') }}</p>
      </div>
      <div v-else-if="error" class="error">
        {{ $t('common.error') }}: {{ error }}
      </div>
      <div v-else class="movies-grid">
        <router-link
          v-for="movie in movies"
          :key="movie.id || movie.movie_id"
          :to="{ name: 'MovieDetail', params: { id: movie.id || movie.movie_id } }"
          class="movie-card-link"
        >
          <div class="movie-card">
            <div class="card-cover" :style="cardBgStyle(movie)"></div>
            <div class="movie-info">
              <h3>{{ movie.title }}</h3>
              <p class="release-date">{{ formatDate(movie.release_date) }}</p>
              <div class="rating">
                <span class="stars">{{ '★'.repeat(Math.round(movie.reviews_summary?.average_rating || 0)) }}</span>
                <span class="rating-text">{{ movie.reviews_summary?.average_rating || 'N/A' }}/5</span>
              </div>
              <p class="review-count">{{ movie.reviews_summary?.count || 0 }} {{ $t('common.reviews') }}</p>
            </div>
          </div>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script>
import { STORAGE_URLS, API_BASE_URL } from './config'
import defaultPoster from '@/assets/poster.png'
import moviesService from './services/moviesService'
import authService from './services/authService'

const API_ORIGIN = (() => {
  try { return new URL(API_BASE_URL).origin } catch (e) { return API_BASE_URL }
})()

export default {
  name: 'App',
  data() {
    return {
      movies: [],
      loading: true,
      error: null,
      STORAGE_URLS,
      showUserMenu: false,
      searchQuery: '',
      searchTimer: null,
      userRole: null,
      token: localStorage.getItem('token') || null
    }
  },
  computed: {
    isLoggedIn() {
      return !!this.token
    },
    isAdmin() {
      return this.isLoggedIn && this.userRole === 'A'
    }
  },
  mounted() {
    this.updateAuthState()
    this.fetchPopularMovies()
    if (this.isLoggedIn) this.fetchUserRole()
    window.addEventListener('auth-changed', this.updateAuthState)
    window.addEventListener('storage', this.updateAuthState)
  },
  beforeUnmount() {
    window.removeEventListener('auth-changed', this.updateAuthState)
    window.removeEventListener('storage', this.updateAuthState)
  },
  methods: {
    updateAuthState() {
      const t = localStorage.getItem('token') || null
      const changed = t !== this.token
      this.token = t
      if (changed) {
        if (this.token) {
          this.fetchUserRole()
        } else {
          this.userRole = null
        }
      }
    },
    async fetchPopularMovies() {
      try {
        const response = await moviesService.popular({ per_page: 20 })
        const payload = response.data
        this.movies = Array.isArray(payload) ? payload : (payload?.data || [])
        this.loading = false
      } catch (error) {
        this.movies = null
        this.error = null
        this.loading = false
      }
    },
    async searchMovies() {
      if (!this.searchQuery.trim()) {
        this.fetchPopularMovies()
        return
      }
      this.loading = true
      try {
        const response = await moviesService.search({ title: this.searchQuery.trim(), per_page: 20 })
        const payload = response.data
        this.movies = Array.isArray(payload) ? payload : (payload?.data || [])
        this.loading = false
      } catch (error) {
        this.error = error.message
        this.loading = false
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.getFullYear()
    },
    resolvePoster(movie) {
      const p = movie.poster_path
      if (!p) return defaultPoster
      if (typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'))) return p
      if (typeof p === 'string' && p.startsWith('/')) return `${API_ORIGIN}${p}`
      if (typeof p === 'string' && p.startsWith('storage/')) return `${API_ORIGIN}/${p}`
      return `${API_ORIGIN}/storage/${p}`
    },
    cardBgStyle(movie) {
      const url = this.resolvePoster(movie)
      return { backgroundImage: `url('${encodeURI(url)}')` }
    },
    setLanguage(lang) {
      this.$i18n.locale = lang
      localStorage.setItem('language', lang)
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },
    onSearchInput() {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.searchMovies(), 400)
    },
    async handleLogout() {
      try {
        await authService.logout()
      } catch (e) { console.error(e) }
      localStorage.removeItem('token')
      this.token = null
      this.showUserMenu = false
      this.$router.push('/')
      this.userRole = null
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn: false } }))
    },
    async fetchUserRole() {
      if (!this.isLoggedIn) return
      try {
        const response = await authService.me()
        const payload = response.data
        this.userRole = payload?.data?.role || payload?.role || payload?.user?.role || null
      } catch (e) {
        this.userRole = null
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: linear-gradient(135deg, #0f1419 0%, #1a202c 50%, #14181c 100%);
  background-attachment: fixed;
  color: #fff;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, rgba(44, 52, 64, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
  padding: 2rem 0;
  border-bottom: 1px solid rgba(58, 69, 83, 0.5);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0;
  color: #00d4aa;
  transition: color 0.3s ease;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.header h1:hover {
  color: #00b894;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #3a4553;
  background-color: transparent;
  color: #9ab;
}

.dropdown {
  position: absolute;
  top: 48px;
  right: 0;
  background: linear-gradient(135deg, #2c3440 0%, #1a202c 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-width: 180px;
  z-index: 10;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  color: #9ab;
  text-decoration: none;
  background: transparent;
  border: none;
}

.dropdown-item:hover {
  background-color: #3a4553;
  color: #fff;
}

.search-box {
  margin-left: 1rem;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border: 2px solid #3a4553;
  border-radius: 8px;
  background-color: rgba(26, 32, 44, 0.8);
  color: #fff;
}

.nav-link {
  color: #9ab;
  text-decoration: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-link:hover {
  background-color: #3a4553;
  color: #fff;
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  background-color: #00d4aa;
  color: #14181c;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
}

.language-selector {
  display: flex;
  gap: 0.5rem;
  margin-left: 1.5rem;
  border-left: 1px solid #3a4553;
  padding-left: 1.5rem;
}

.lang-btn {
  background-color: transparent;
  color: #9ab;
  border: 2px solid #3a4553;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 3rem;
  text-align: center;
}

.lang-btn:hover {
  background-color: #3a4553;
  color: #fff;
  border-color: #4a5563;
  transform: translateY(-1px);
}

.lang-btn.active {
  background-color: #00d4aa;
  color: #14181c;
  border-color: #00d4aa;
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
}

.header p {
  font-size: 1.1rem;
  color: #9ab;
  text-align: center;
  margin-top: 1.5rem;
  font-weight: 400;
  opacity: 0.9;
}

.main-content {
  padding: 3rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  font-size: 1.25rem;
  padding: 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(44, 52, 64, 0.8) 0%, rgba(26, 32, 44, 0.8) 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.loading-bar-container {
  width: 250px;
  height: 6px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 3px;
  margin: 0 auto 1.5rem;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.loading-bar {
  height: 100%;
  background: linear-gradient(90deg, #00d4aa 0%, #00f5d4 50%, #00d4aa 100%);
  border-radius: 3px;
  animation: loading 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(0, 212, 170, 0.5);
}

@keyframes loading {
  0% {
    width: 0%;
    transform: translateX(0%);
  }
  50% {
    width: 100%;
    transform: translateX(0%);
  }
  100% {
    width: 0%;
    transform: translateX(100%);
  }
}

.loading-text {
  margin: 0;
  color: #e2e8f0;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.error {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  margin-top: 3rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    padding: 0 1.5rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 2rem;
  }

  .card-cover {
    height: 380px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 1.5rem 0;
  }

  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    padding: 0 1rem;
  }

  .header h1 {
    font-size: 2rem;
    text-align: center;
  }

  .nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
  }

  .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .language-selector {
    margin-left: 0;
    border-left: none;
    padding-left: 0;
    border-top: 1px solid #3a4553;
    padding-top: 1rem;
    margin-top: 1rem;
    width: 100%;
    justify-content: center;
  }

  .header p {
    margin-top: 1rem;
    font-size: 1rem;
    padding: 0 1rem;
  }

  .main-content {
    padding: 2rem 1rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .movie-card {
    max-width: 100%;
  }

  .card-cover {
    height: 350px;
  }

  .movie-info {
    padding: 1.25rem;
  }

  .movie-info h3 {
    font-size: 1.15rem;
  }
}

@media (max-width: 640px) {
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }

  .card-cover {
    height: 320px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 1.25rem 0;
  }

  .header-content {
    gap: 1.25rem;
    padding: 0 0.75rem;
  }

  .header h1 {
    font-size: 1.75rem;
  }

  .nav {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .nav-link {
    padding: 0.5rem 0.875rem;
    font-size: 0.85rem;
    flex: 1 1 auto;
    min-width: calc(50% - 0.25rem);
    text-align: center;
  }

  .language-selector {
    gap: 0.5rem;
    padding-top: 0.875rem;
    margin-top: 0.875rem;
  }

  .lang-btn {
    padding: 0.5rem 0.875rem;
    min-width: 2.75rem;
    font-size: 0.8rem;
    flex: 1;
    max-width: 80px;
  }

  .header p {
    font-size: 0.95rem;
    padding: 0 0.75rem;
    margin-top: 0.875rem;
  }

  .main-content {
    padding: 1.5rem 0.75rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.25rem;
    margin-top: 1.5rem;
  }

  .movie-card {
    max-width: 100%;
  }

  .card-cover {
    height: 280px;
  }

  .movie-info {
    padding: 1rem;
  }

  .movie-info h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .release-date {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .rating {
    margin-bottom: 0.5rem;
    gap: 0.375rem;
  }

  .stars {
    font-size: 1rem;
  }

  .rating-text {
    font-size: 0.85rem;
    padding: 0.2rem 0.4rem;
  }

  .review-count {
    font-size: 0.8rem;
  }

  .loading, .error {
    padding: 1.5rem;
    font-size: 1.1rem;
    margin: 1rem;
  }

  .loading-bar-container {
    width: 200px;
  }
}

@media (max-width: 360px) {
  .header {
    padding: 1rem 0;
  }

  .header-content {
    padding: 0 0.5rem;
    gap: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .nav {
    gap: 0.375rem;
  }

  .nav-link {
    padding: 0.45rem 0.75rem;
    font-size: 0.8rem;
    min-width: calc(50% - 0.1875rem);
  }

  .header p {
    font-size: 0.9rem;
    padding: 0 0.5rem;
    margin-top: 0.75rem;
  }

  .main-content {
    padding: 1.25rem 0.5rem;
  }

  .movies-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1.25rem;
  }

  .card-cover {
    height: 400px;
  }

  .movie-card:hover {
    transform: translateY(-8px) scale(1.02);
  }

  .loading, .error {
    padding: 1.25rem;
    font-size: 1rem;
    margin: 0.75rem;
  }

  .loading-bar-container {
    width: 180px;
  }

  .loading-text {
    font-size: 1rem;
  }
}

.movie-card-link {
  text-decoration: none;
  color: inherit;
}

.movie-card {
  background: linear-gradient(135deg, rgba(44, 52, 64, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.movie-card:hover {
  transform: translateY(-16px) scale(1.05);
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 170, 0.2);
  border-color: rgba(0, 212, 170, 0.4);
}

.card-cover {
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.4s ease;
}

.movie-card:hover .card-cover {
  transform: scale(1.05);
}

.movie-info {
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(44, 52, 64, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
  backdrop-filter: blur(20px);
}

.movie-info h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: #fff;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.release-date {
  color: #9ab;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
  opacity: 0.9;
}

.rating {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.stars {
  color: #00d4aa;
  font-size: 1.1rem;
  filter: drop-shadow(0 0 4px rgba(0, 212, 170, 0.3));
}

.rating-text {
  color: #9ab;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: rgba(0, 212, 170, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 170, 0.2);
}

.review-count {
  color: #9ab;
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.review-count::before {
  content: '👥';
  font-size: 0.75rem;
}
</style>
