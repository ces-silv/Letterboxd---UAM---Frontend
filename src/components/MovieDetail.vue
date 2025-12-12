<template>
  <div class="movie-detail">
    <div v-if="loading" class="loading">{{ $t('movie.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="movie" class="movie-content">
      <div class="movie-header">
        <img :src="movie.poster_path || defaultPoster" :alt="movie.title" class="movie-poster-large" />
        <div class="movie-info">
          <h1>{{ movie.title }}</h1>
          <p class="release-date">{{ formatDate(movie.release_date) }}</p>
          <p class="director" v-if="movie.director">{{ $t('movie.directedBy') }} {{ movie.director.name }}</p>
          <p class="synopsis">{{ movie.synopsis }}</p>
          <div class="movie-stats">
            <div class="stat">
              <span class="stat-label">{{ $t('movie.duration') }}:</span>
              <span>{{ movie.duration }} min</span>
            </div>
            <div class="stat">
              <span class="stat-label">{{ $t('movie.averageRating') }}:</span>
              <span>{{ movie.reviews?.average_rating || 'N/A' }}/5</span>
            </div>
            <div class="stat">
              <span class="stat-label">{{ $t('movie.totalReviews') }}:</span>
              <span>{{ movie.reviews?.count || 0 }}</span>
            </div>
          </div>
          <div v-if="isLoggedIn" class="review-actions">
            <button 
              v-if="!hasUserReview" 
              @click="showReviewForm = !showReviewForm" 
              class="review-btn"
            >
              {{ $t('movie.writeReview') }}
            </button>
            <template v-else>
              <button 
                @click="showReviewForm = !showReviewForm" 
                class="review-btn edit-btn"
              >
                {{ $t('movie.editReview') }}
              </button>
              <button 
                @click="showDeleteModal = true" 
                class="review-btn delete-btn"
                :disabled="deletingReview"
              >
                {{ $t('movie.deleteReview') || 'Delete Review' }}
              </button>
            </template>
          </div>
          <div v-else class="login-cta">
            <router-link :to="{ name: 'Login', query: { redirect: $route.fullPath } }" class="review-btn">{{ $t('auth.loginToReview') || 'Inicia sesión para reseñar' }}</router-link>
          </div>
        </div>
      </div>

      <div v-if="showReviewForm" class="review-form-section">
        <ReviewForm
          :movie-id="movieId"
          :existing-review="hasUserReview && userReview ? userReview : null"
          @review-submitted="handleReviewSubmitted"
          @cancel="showReviewForm = false"
        />
      </div>

      <!-- Delete Review Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Delete Review</h3>
            <button @click="showDeleteModal = false" class="modal-close-btn">×</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete your review? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" class="modal-btn cancel-btn">
              Cancel
            </button>
            <button 
              @click="confirmDeleteReview" 
              class="modal-btn confirm-btn"
              :disabled="deletingReview"
            >
              {{ deletingReview ? 'Deleting...' : 'Delete Review' }}
            </button>
          </div>
        </div>
      </div>

      <div class="movie-sections">
        <section class="cast-section" v-if="movie.cast && movie.cast.length">
          <h2>{{ $t('movie.cast') }}</h2>
          <div class="cast-list">
            <div v-for="actor in movie.cast" :key="actor.id" class="cast-member">
              <span class="actor-name">{{ actor.name }}</span>
              <span class="character-name">as {{ actor.character_name }}</span>
            </div>
          </div>
        </section>

        <section class="statistics-section" v-if="statistics">
          <h2>{{ $t('movie.statistics') }}</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>{{ $t('movie.totalReviews') }}</h3>
              <p class="stat-number">{{ statistics.total_reviews }}</p>
            </div>
            <div class="stat-card">
              <h3>{{ $t('movie.averageRating') }}</h3>
              <p class="stat-number">{{ statistics.average_rating }}/5</p>
            </div>
            <div class="stat-card">
              <h3>{{ $t('movie.reviews') }}</h3>
              <p class="stat-number">{{ statistics.recent_reviews_count }}</p>
            </div>
          </div>
          <div class="rating-distribution">
            <h3>{{ $t('movie.reviews') }}</h3>
            <div class="distribution-bars">
              <div v-for="(count, rating) in statistics.rating_distribution" :key="rating" class="distribution-bar">
                <span class="rating-label">{{ rating }}★</span>
                <div class="bar-container">
                  <div class="bar" :style="{ width: getBarWidth(count, statistics.total_reviews) }"></div>
                </div>
                <span class="count">{{ count }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="reviews-section">
          <h2>{{ $t('movie.reviews') }} ({{ reviews.length }})</h2>
          <div v-if="reviews.length === 0" class="no-reviews">
            {{ $t('movie.noReviews') }}
          </div>
          <div v-else class="reviews-list">
            <div 
              v-for="review in reviews" 
              :key="review.id" 
              class="review-card"
              :class="{ 'user-review': isUserReview(review) }"
            >
              <div class="review-header">
                <span class="review-rating">{{ '★'.repeat(review.rating) }}</span>
                <div class="review-header-right">
                  <span v-if="isUserReview(review)" class="review-badge">Your Review</span>
                  <span class="review-date">{{ formatDate(review.created_at) }}</span>
                </div>
              </div>
              <p class="review-comment" v-if="review.comment">{{ review.comment }}</p>
              <p class="review-author">{{ $t('movie.by') }} {{ getReviewAuthor(review) }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import ReviewForm from './ReviewForm.vue'
import { STORAGE_URLS } from '../config'
import moviesService from '../services/moviesService'
import reviewsService from '../services/reviewsService'
import defaultPoster from '@/assets/poster.png'

export default {
  name: 'MovieDetail',
  components: {
    ReviewForm
  },
  props: {
    movieId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      movie: null,
      statistics: null,
      reviews: [],
      loading: true,
      error: null,
      showReviewForm: false,
      userReview: null,
      deletingReview: false,
      showDeleteModal: false,
      STORAGE_URLS,
      defaultPoster
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    },
    hasUserReview() {
      return !!this.userReview
    }
  },
  mounted() {
    this.fetchMovieDetails()
    this.fetchMovieStatistics()
    this.fetchMovieReviews()
    if (this.isLoggedIn) {
      this.checkUserReview()
    }
  },
  methods: {
    async fetchMovieDetails() {
      try {
        const response = await moviesService.getById(this.movieId, { include: 'director,cast,genres,reviews' })
        this.movie = response.data.data
      } catch (error) {
        this.error = 'Failed to load movie details'
      }
    },
    async fetchMovieStatistics() {
      try {
        const response = await moviesService.stats(this.movieId)
        this.statistics = response.data.statistics
      } catch (error) { console.error(error) }
    },
    async fetchMovieReviews() {
      try {
        const response = await moviesService.reviewsForMovie(this.movieId)
        this.reviews = response.data.data || []
      } catch (error) { console.error(error) } finally {
        this.loading = false
      }
    },
    async checkUserReview() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.userReview = null
          return
        }
        const response = await reviewsService.reviewStatus(this.movieId)
        if (response.data.has_reviewed && response.data.review) {
          this.userReview = response.data.review
        } else {
          this.userReview = null
        }
      } catch (error) {
        if (error.response?.status === 404) {
          this.userReview = null
        } else {
          this.userReview = null
        }
      }
    },
    handleReviewSubmitted() {
      this.showReviewForm = false
      this.fetchMovieDetails()
      this.fetchMovieStatistics()
      this.fetchMovieReviews()
      this.checkUserReview()
    },
    confirmDeleteReview() {
      if (!this.userReview) {
        return
      }

      this.deletingReview = true
      const reviewId = this.userReview.id
      
      reviewsService.remove(reviewId)
      .then(() => {
        this.userReview = null
        this.showReviewForm = false
        this.showDeleteModal = false
        this.fetchMovieDetails()
        this.fetchMovieStatistics()
        this.fetchMovieReviews()
      })
      .catch((error) => {
        alert(error.response?.data?.message || 'Failed to delete review')
      })
      .finally(() => {
        this.deletingReview = false
      })
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    getBarWidth(count, total) {
      if (total === 0) return '0%'
      return `${(count / total) * 100}%`
    },
    isUserReview(review) {
      return this.userReview && this.userReview.id === review.id
    },
    getReviewAuthor(review) {
      return review.user || review.username || (review.user && review.user.username) || (this.$t('movie.anonymous') || 'Anonymous User')
    }
  }
}
</script>

<style scoped>
.movie-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #fff;
  min-height: 100vh;
}

.loading, .error {
  text-align: center;
  font-size: 1.5rem;
  margin: 2rem 0;
}

.error {
  color: #ff6b6b;
}

.movie-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.movie-poster-large {
  width: 300px;
  height: 450px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.movie-info h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.release-date {
  color: #9ab;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.director {
  color: #00d4aa;
  font-weight: bold;
  margin-bottom: 1rem;
}

.synopsis {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 1rem;
  max-width: 100%;
  word-wrap: break-word;
}

.movie-stats {
  padding-bottom: 2rem;
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-label {
  color: #9ab;
  font-size: 0.9rem;
}

.stat span:last-child {
  color: #fff;
  font-weight: bold;
}

.review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.login-cta {
  margin-top: 1rem;
}

.review-btn {
  background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
  color: #14181c;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 212, 170, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.review-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 170, 0.4);
}

.review-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.review-btn.edit-btn {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.review-btn.edit-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
}

.review-btn.delete-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  color: #fff;
}

.review-btn.delete-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.review-form-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #2c3440 0%, #1a202c 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
}

.movie-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.cast-section h2,
.statistics-section h2,
.reviews-section h2 {
  color: #00d4aa;
  border-bottom: 1px solid #3a4553;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.cast-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cast-member {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(44, 52, 64, 0.8) 0%, rgba(26, 32, 44, 0.8) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.cast-member:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.actor-name {
  font-weight: bold;
  color: #fff;
}

.character-name {
  color: #9ab;
  font-style: italic;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, rgba(44, 52, 64, 0.8) 0%, rgba(26, 32, 44, 0.8) 100%);
  padding: 1.5rem;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.stat-card h3 {
  color: #9ab;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #00d4aa;
}

.rating-distribution h3 {
  color: #9ab;
  margin-bottom: 1rem;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.distribution-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-label {
  width: 30px;
  color: #fff;
  font-weight: bold;
}

.bar-container {
  flex: 1;
  height: 20px;
  min-height: 20px;
  background-color: #3a4553;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.bar {
  height: 100%;
  background-color: #00d4aa;
  transition: width 0.3s ease;
}

.count {
  width: 30px;
  text-align: right;
  color: #9ab;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-card {
  background: linear-gradient(135deg, rgba(44, 52, 64, 0.8) 0%, rgba(26, 32, 44, 0.8) 100%);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.review-card.user-review {
  border: 2px solid rgba(0, 212, 170, 0.3);
  background: linear-gradient(135deg, rgba(44, 52, 64, 0.95) 0%, rgba(0, 212, 170, 0.05) 100%);
}

.review-card.user-review:hover {
  border-color: rgba(0, 212, 170, 0.5);
  box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.review-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.review-badge {
  background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
  color: #14181c;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.review-rating {
  color: #00d4aa;
  font-size: 1.2rem;
}

.review-date {
  color: #9ab;
  font-size: 0.9rem;
}

.review-comment {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.review-author {
  color: #9ab;
  font-size: 0.9rem;
  font-style: italic;
}

.no-reviews {
  text-align: center;
  color: #9ab;
  font-style: italic;
  padding: 2rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: linear-gradient(135deg, #2c3440 0%, #1a202c 100%);
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: #fff;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: #9ab;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body {
  padding: 2rem;
  color: #ccc;
  line-height: 1.6;
}

.modal-body p {
  margin: 0;
  font-size: 1.1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-btn.cancel-btn {
  background: linear-gradient(135deg, #3a4553 0%, #4a5563 100%);
  color: #9ab;
}

.modal-btn.cancel-btn:hover {
  background: linear-gradient(135deg, #4a5563 0%, #5a6573 100%);
  color: #fff;
  transform: translateY(-2px);
}

.modal-btn.confirm-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.modal-btn.confirm-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ee5a6f 0%, #dd4a5f 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .movie-detail {
    padding: 1.5rem;
  }

  .movie-header {
    gap: 1.5rem;
  }

  .movie-poster-large {
    width: 280px;
    height: 420px;
  }

  .movie-info h1 {
    font-size: 2.25rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .movie-detail {
    padding: 1rem;
  }

  .movie-header {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }

  .movie-poster-large {
    width: 250px;
    height: 375px;
  }

  .movie-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .movie-info h1 {
    font-size: 2rem;
    text-align: center;
  }

  .synopsis {
    text-align: center;
    max-width: 100%;
  }

  .director {
    text-align: center;
  }

  .movie-stats {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
    width: 100%;
  }

  .stat {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.25rem;
    min-width: 100px;
  }

  .review-actions {
    justify-content: center;
    width: 100%;
    flex-direction: column;
    align-items: center;
  }

  .review-btn {
    width: 100%;
    max-width: 400px;
    margin: 0;
  }

  .modal-container {
    width: 95%;
    max-width: 400px;
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
  }

  .modal-header h3 {
    font-size: 1.25rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-body p {
    font-size: 1rem;
  }

  .modal-footer {
    padding: 1.25rem 1.5rem;
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
  }

  .review-form-section {
    margin: 1.5rem 0;
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .distribution-bar {
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
  }

  .rating-label {
    width: 45px;
    flex-shrink: 0;
    font-size: 0.95rem;
  }

  .bar-container {
    flex: 1;
    min-width: 120px;
    height: 24px;
  }

  .count {
    width: 45px;
    text-align: right;
    flex-shrink: 0;
    font-size: 0.9rem;
  }

  .cast-member {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .review-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .movie-detail {
    padding: 0.75rem;
  }

  .movie-header {
    gap: 1rem;
  }

  .movie-poster-large {
    width: 200px;
    height: 300px;
  }

  .movie-info h1 {
    font-size: 1.75rem;
    line-height: 1.2;
  }

  .release-date {
    font-size: 1rem;
  }

  .director {
    font-size: 0.95rem;
  }

  .synopsis {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .movie-stats {
    gap: 1rem;
    flex-direction: column;
  }

  .stat {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    max-width: 250px;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .stat-label {
    font-size: 0.85rem;
  }

  .stat span:last-child {
    font-size: 0.95rem;
  }

  .review-btn {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    max-width: 100%;
  }

  .review-form-section {
    padding: 0.875rem;
    margin: 1rem 0;
  }

  .movie-sections {
    gap: 1.5rem;
  }

  .cast-section h2,
  .statistics-section h2,
  .reviews-section h2 {
    font-size: 1.5rem;
  }

  .cast-member {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    padding: 0.875rem;
  }

  .actor-name,
  .character-name {
    font-size: 0.9rem;
  }

  .character-name {
    margin-left: 0;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1.25rem 1rem;
  }

  .stat-card h3 {
    font-size: 0.95rem;
  }

  .stat-number {
    font-size: 1.75rem;
  }

  .rating-distribution {
    margin-top: 1rem;
  }

  .rating-distribution h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .distribution-bars {
    gap: 1rem;
  }

  .distribution-bar {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.5rem 0;
  }

  .rating-label {
    width: 40px;
    flex-shrink: 0;
    font-size: 0.9rem;
    text-align: left;
  }

  .bar-container {
    flex: 1;
    width: 100%;
    min-width: 0;
    height: 22px;
    min-height: 22px;
  }

  .count {
    width: 35px;
    text-align: right;
    flex-shrink: 0;
    font-size: 0.85rem;
  }

  .reviews-list {
    gap: 0.75rem;
  }

  .review-card {
    padding: 1rem;
  }

  .review-rating {
    font-size: 1.1rem;
  }

  .review-date {
    font-size: 0.8rem;
  }

  .review-header-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .review-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
  }

  .review-comment {
    font-size: 0.9rem;
  }

  .review-author {
    font-size: 0.85rem;
  }
}

@media (max-width: 360px) {
  .movie-detail {
    padding: 0.5rem;
  }

  .movie-poster-large {
    width: 180px;
    height: 270px;
  }

  .movie-info h1 {
    font-size: 1.5rem;
  }

  .movie-stats {
    gap: 0.75rem;
  }

  .stat {
    max-width: 100%;
  }

  .stats-grid {
    gap: 0.5rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .rating-distribution h3 {
    font-size: 0.95rem;
    margin-bottom: 0.875rem;
  }

  .distribution-bars {
    gap: 0.875rem;
  }

  .distribution-bar {
    gap: 0.625rem;
    padding: 0.4rem 0;
  }

  .rating-label {
    width: 35px;
    font-size: 0.85rem;
  }

  .bar-container {
    height: 20px;
    min-height: 20px;
  }

  .count {
    width: 30px;
    font-size: 0.8rem;
  }
}
</style>
