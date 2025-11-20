<template>
  <div class="profile">
    <div v-if="loading" class="loading">{{ $t('profile.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="user" class="profile-content">
      <div class="profile-header">
        <h1>{{ $t('profile.title') }}</h1>
        <button @click="showEditForm = !showEditForm" class="edit-btn">
          {{ showEditForm ? $t('profile.cancel') : $t('profile.edit') }}
        </button>
      </div>

      <div v-if="showEditForm" class="edit-form-section">
        <ProfileEditForm
          :user="user"
          @profile-updated="handleProfileUpdated"
          @cancel="showEditForm = false"
        />
      </div>

      <div v-else class="profile-info">
        <div class="info-card">
          <h2>{{ $t('profile.personalInfo') }}</h2>
          <div class="info-row">
            <span class="label">{{ $t('profile.username') }}:</span>
            <span class="value">{{ user.username }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('profile.email') }}:</span>
            <span class="value">{{ user.email }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('profile.memberSince') }}:</span>
            <span class="value">{{ formatDate(user.created_at) }}</span>
          </div>
        </div>

        <div class="stats-card">
          <h2>{{ $t('profile.activity') }}</h2>
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-number">{{ user.reviews_count || 0 }}</div>
              <div class="stat-label">{{ $t('profile.reviewsWritten') }}</div>
            </div>
            <div class="stat">
              <div class="stat-number">{{ user.average_rating || 'N/A' }}</div>
              <div class="stat-label">{{ $t('profile.averageRating') }}</div>
            </div>
          </div>
        </div>
        <div class="reviews-card">
          <h2>{{ $t('profile.myReviews') || 'Mis reseñas' }}</h2>
          <div v-if="reviewsLoading" class="loading">{{ $t('common.loading') }}</div>
          <div v-else-if="myReviews.length === 0" class="no-reviews">{{ $t('movie.noReviews') }}</div>
          <div v-else class="my-reviews-list">
            <div v-for="rev in myReviews" :key="rev.id" class="my-review-item">
              <div class="left">
                <router-link :to="{ name: 'MovieDetail', params: { id: (rev.movie && rev.movie.id) || rev.movie_id } }" class="movie-link">{{ (rev.movie && rev.movie.title) || ('#' + rev.movie_id) }}</router-link>
                <span class="date">{{ formatDate(rev.created_at) }}</span>
              </div>
              <div class="right">
                <span class="rating">{{ '★'.repeat(rev.rating) }}</span>
              </div>
            </div>
          </div>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
  </div>
</template>

<script>
import ProfileEditForm from './ProfileEditForm.vue'
import ChangePasswordForm from './ChangePasswordForm.vue'
import authService from '../services/authService'
import reviewsService from '../services/reviewsService'

export default {
  name: 'UserProfile',
  components: {
    ProfileEditForm,
    ChangePasswordForm
  },
  data() {
    return {
      user: null,
      loading: true,
      error: null,
      showEditForm: false,
      myReviews: [],
      reviewsLoading: false
    }
  },
  mounted() {
    this.fetchUserProfile()
    this.fetchMyReviews()
  },
  methods: {
    async fetchUserProfile() {
      try {
        const response = await authService.me()
        this.user = response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load profile'
      } finally {
        this.loading = false
      }
    },
    async fetchMyReviews() {
      this.reviewsLoading = true
      try {
        const response = await reviewsService.myReviews({ per_page: 10, include: 'movie' })
        this.myReviews = response.data.data || []
      } catch (error) {
        console.error(error)
      } finally {
        this.reviewsLoading = false
      }
    },
    handleProfileUpdated() {
      this.showEditForm = false
      this.fetchUserProfile()
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
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

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-header h1 {
  color: #00d4aa;
  font-size: 2.5rem;
  margin: 0;
}

.edit-btn {
  background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
  color: #14181c;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 212, 170, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 170, 0.4);
}

.edit-form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #2c3440 0%, #1a202c 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card, .stats-card {
  background: linear-gradient(135deg, rgba(44, 52, 64, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.info-card h2, .stats-card h2 {
  color: #00d4aa;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #3a4553;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #9ab;
  font-weight: 500;
}

.value {
  color: #fff;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.reviews-card {
  background: linear-gradient(135deg, rgba(44, 52, 64, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.my-reviews-list { display: flex; flex-direction: column; gap: 0.75rem; }
.my-review-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border: 1px solid #3a4553; border-radius: 12px; }
.movie-link { color: #00d4aa; text-decoration: none; }
.movie-link:hover { text-decoration: underline; }
.date { color: #9ab; margin-left: 0.5rem; }
.rating { color: #00d4aa; font-weight: bold; }

.stat {
  text-align: center;
  padding: 1.5rem;
  background-color: rgba(0, 212, 170, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 170, 0.2);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #00d4aa;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #9ab;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .profile {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .profile-header h1 {
    font-size: 2rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>