<template>
  <div class="movie-detail">
    <div v-if="loading" class="loading">Loading movie details...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="movie" class="movie-content">
      <div class="movie-header">
        <img :src="movie.poster_path" :alt="movie.title" class="movie-poster-large" />
        <div class="movie-info">
          <h1>{{ movie.title }}</h1>
          <p class="release-date">{{ formatDate(movie.release_date) }}</p>
          <p class="director" v-if="movie.director">Directed by {{ movie.director.name }}</p>
          <p class="synopsis">{{ movie.synopsis }}</p>
          <div class="movie-stats">
            <div class="stat">
              <span class="stat-label">Duration:</span>
              <span>{{ movie.duration }} min</span>
            </div>
            <div class="stat">
              <span class="stat-label">Average Rating:</span>
              <span>{{ movie.reviews?.average_rating || 'N/A' }}/5</span>
            </div>
            <div class="stat">
              <span class="stat-label">Total Reviews:</span>
              <span>{{ movie.reviews?.count || 0 }}</span>
            </div>
          </div>
          <button v-if="isLoggedIn" @click="showReviewForm = !showReviewForm" class="review-btn">
            {{ hasUserReview ? 'Edit Review' : 'Write Review' }}
          </button>
        </div>
      </div>

      <div v-if="showReviewForm" class="review-form-section">
        <ReviewForm
          :movie-id="movieId"
          :existing-review="userReview"
          @review-submitted="handleReviewSubmitted"
          @cancel="showReviewForm = false"
        />
      </div>

      <div class="movie-sections">
        <section class="cast-section" v-if="movie.cast && movie.cast.length">
          <h2>Cast</h2>
          <div class="cast-list">
            <div v-for="actor in movie.cast" :key="actor.id" class="cast-member">
              <span class="actor-name">{{ actor.name }}</span>
              <span class="character-name">as {{ actor.character_name }}</span>
            </div>
          </div>
        </section>

        <section class="statistics-section" v-if="statistics">
          <h2>Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Reviews</h3>
              <p class="stat-number">{{ statistics.total_reviews }}</p>
            </div>
            <div class="stat-card">
              <h3>Average Rating</h3>
              <p class="stat-number">{{ statistics.average_rating }}/5</p>
            </div>
            <div class="stat-card">
              <h3>Recent Reviews</h3>
              <p class="stat-number">{{ statistics.recent_reviews_count }}</p>
            </div>
          </div>
          <div class="rating-distribution">
            <h3>Rating Distribution</h3>
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
          <h2>Reviews ({{ reviews.length }})</h2>
          <div v-if="reviews.length === 0" class="no-reviews">
            No reviews yet. Be the first to review this movie!
          </div>
          <div v-else class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-card">
              <div class="review-header">
                <span class="review-rating">{{ '★'.repeat(review.rating) }}</span>
                <span class="review-date">{{ formatDate(review.created_at) }}</span>
              </div>
              <p class="review-comment" v-if="review.comment">{{ review.comment }}</p>
              <p class="review-author">By Anonymous User</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import ReviewForm from './ReviewForm.vue'

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
      userReview: null
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
        const response = await axios.get(`http://localhost:8000/api/movies/${this.movieId}?include=director,cast,genres,reviews`)
        this.movie = response.data
      } catch (error) {
        this.error = 'Failed to load movie details'
        console.error(error)
      }
    },
    async fetchMovieStatistics() {
      try {
        const response = await axios.get(`http://localhost:8000/api/movies/${this.movieId}/statistics`)
        this.statistics = response.data.statistics
      } catch (error) {
        console.error('Failed to load statistics:', error)
      }
    },
    async fetchMovieReviews() {
      try {
        const response = await axios.get(`http://localhost:8000/api/movies/${this.movieId}/reviews`)
        this.reviews = response.data.data || []
      } catch (error) {
        console.error('Failed to load reviews:', error)
      } finally {
        this.loading = false
      }
    },
    async checkUserReview() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:8000/api/reviews/my-reviews?include=movie', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const userReviews = response.data.data || []
        this.userReview = userReviews.find(review => review.movie_id == this.movieId)
      } catch (error) {
        console.error('Failed to check user review:', error)
      }
    },
    handleReviewSubmitted() {
      this.showReviewForm = false
      this.fetchMovieDetails()
      this.fetchMovieStatistics()
      this.fetchMovieReviews()
      this.checkUserReview()
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    getBarWidth(count, total) {
      if (total === 0) return '0%'
      return `${(count / total) * 100}%`
    }
  }
}
</script>

<style scoped>
.movie-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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
  border-radius: 8px;
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
}

.movie-stats {
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

.review-btn {
  background-color: #00d4aa;
  color: #14181c;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.review-btn:hover {
  background-color: #00b894;
}

.review-form-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #2c3440;
  border-radius: 8px;
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
  padding: 0.5rem;
  background-color: #2c3440;
  border-radius: 4px;
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
  background-color: #2c3440;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
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
  background-color: #3a4553;
  border-radius: 10px;
  overflow: hidden;
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
  background-color: #2c3440;
  padding: 1rem;
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
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
</style>