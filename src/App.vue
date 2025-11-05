<template>
  <div id="app">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo-link">
          <h1>Letterboxd UAM</h1>
        </router-link>
        <nav class="nav">
          <router-link to="/" class="nav-link">{{ $t('nav.home') }}</router-link>
          <router-link to="/login" class="nav-link">{{ $t('nav.login') }}</router-link>
          <router-link to="/register" class="nav-link">{{ $t('nav.register') }}</router-link>
          <router-link to="/profile" class="nav-link">{{ $t('nav.profile') }}</router-link>
          <div class="language-selector">
            <button @click="setLanguage('en')" :class="{ active: $i18n.locale === 'en' }" class="lang-btn">EN</button>
            <button @click="setLanguage('es')" :class="{ active: $i18n.locale === 'es' }" class="lang-btn">ES</button>
          </div>
        </nav>
      </div>
      <p v-if="$route.path === '/'">{{ $t('header.subtitle') }}</p>
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
        <router-link v-for="movie in movies" :key="movie.id" :to="{ name: 'MovieDetail', params: { id: movie.id } }" class="movie-card-link">
          <div class="movie-card">
            <img :src="movie.poster_path || STORAGE_URLS.NO_PHOTO" :alt="movie.title" class="movie-poster" />
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
import axios from 'axios'
import { API_ENDPOINTS, STORAGE_URLS } from './config'

export default {
  name: 'App',
  data() {
    return {
      movies: [],
      loading: true,
      error: null,
      STORAGE_URLS
    }
  },
  mounted() {
    this.fetchPopularMovies()
  },
  methods: {
    async fetchPopularMovies() {
      try {
        const response = await axios.get(`${API_ENDPOINTS.MOVIES}?per_page=20&include=director`)
        this.movies = response.data.data
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
    setLanguage(lang) {
      this.$i18n.locale = lang
      localStorage.setItem('language', lang)
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
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    padding: 0 0.5rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
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
  }

  .main-content {
    padding: 2rem 0.5rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 1.5rem 0;
  }

  .header h1 {
    font-size: 1.75rem;
  }

  .nav {
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .lang-btn {
    padding: 0.4rem 0.8rem;
    min-width: 2.5rem;
    font-size: 0.8rem;
  }

  .movies-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .movie-card {
    max-width: 100%;
  }

  .main-content {
    padding: 1.5rem 0.25rem;
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

.movie-poster {
  width: 100%;
  height: 400px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.movie-card:hover .movie-poster {
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
