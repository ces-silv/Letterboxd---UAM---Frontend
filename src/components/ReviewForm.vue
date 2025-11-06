<template>
  <div class="review-form">
    <h3>{{ isEditing ? 'Edit Review' : 'Write a Review' }}</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="rating">Rating (1-5 stars)</label>
        <div class="rating-input">
          <div class="stars">
            <span
              v-for="star in 5"
              :key="star"
              @click="rating = star"
              :class="{ active: star <= rating }"
              class="star"
            >
              ★
            </span>
          </div>
          <span class="rating-text">{{ rating }}/5</span>
        </div>
      </div>
      <div class="form-group">
        <label for="comment">Comment (optional)</label>
        <textarea
          id="comment"
          v-model="comment"
          placeholder="Share your thoughts about this movie..."
          class="form-textarea"
          rows="4"
        ></textarea>
      </div>
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="cancel-btn">
          Cancel
        </button>
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review') }}
        </button>
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '../config'

export default {
  name: 'ReviewForm',
  props: {
    movieId: {
      type: [String, Number],
      required: true
    },
    existingReview: {
      type: Object,
      default: null
    }
  },
  emits: ['review-submitted', 'cancel'],
  data() {
    return {
      rating: 5,
      comment: '',
      loading: false,
      error: null
    }
  },
  computed: {
    isEditing() {
      return !!this.existingReview && !!this.existingReview.id
    }
  },
  watch: {
    existingReview: {
      immediate: true,
      handler(newReview) {
        if (newReview && newReview.id) {
          this.rating = newReview.rating || 5
          this.comment = newReview.comment || ''
        } else {
          // Reset to defaults for new review
          this.rating = 5
          this.comment = ''
        }
        this.error = null
      }
    }
  },
  mounted() {
    if (this.isEditing && this.existingReview) {
      this.rating = this.existingReview.rating || 5
      this.comment = this.existingReview.comment || ''
    }
  },
  methods: {
    async handleSubmit() {
      if (this.rating < 1 || this.rating > 5) {
        this.error = 'Rating must be between 1 and 5'
        return
      }

      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')
        const reviewData = {
          movie_id: this.movieId,
          rating: this.rating,
          comment: this.comment.trim() || null
        }

        if (this.isEditing && this.existingReview && this.existingReview.id) {
          // Editing existing review - use PUT endpoint: PUT /api/reviews/{id}
          console.log('Editing review ID:', this.existingReview.id, 'using PUT endpoint')
          await axios.put(`${API_ENDPOINTS.REVIEWS}/${this.existingReview.id}`, reviewData, {
            headers: { Authorization: `Bearer ${token}` }
          })
          console.log('Review updated successfully')
        } else {
          // Creating new review - use POST endpoint
          console.log('Creating new review using POST endpoint')
          await axios.post(API_ENDPOINTS.REVIEWS, reviewData, {
            headers: { Authorization: `Bearer ${token}` }
          })
          console.log('Review created successfully')
        }

        this.$emit('review-submitted')
      } catch (error) {
        // Handle specific error messages from API
        const errorMessage = error.response?.data?.message || 'Failed to submit review'
        const errorDetails = error.response?.data?.errors
        
        if (errorDetails) {
          // Format validation errors
          const errorText = Object.values(errorDetails).flat().join(', ')
          this.error = errorText || errorMessage
        } else {
          this.error = errorMessage
        }
        
        // If it's a duplicate review error, show a more user-friendly message
        if (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('duplicate')) {
          this.error = 'You have already reviewed this movie. Please edit your existing review instead.'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.review-form {
  max-width: 600px;
  margin: 0 auto;
}

.review-form h3 {
  color: #00d4aa;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #9ab;
  font-weight: bold;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  font-size: 2rem;
  color: #3a4553;
  cursor: pointer;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.star.active {
  color: #00d4aa;
  filter: drop-shadow(0 0 10px rgba(0, 212, 170, 0.5));
}

.star:hover {
  color: #00b894;
  transform: scale(1.1);
}

.rating-text {
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
}

.form-textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #3a4553;
  border-radius: 12px;
  background-color: rgba(26, 32, 44, 0.8);
  color: #fff;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-textarea:focus {
  outline: none;
  border-color: #00d4aa;
  box-shadow: 0 0 20px rgba(0, 212, 170, 0.2);
  background-color: rgba(26, 32, 44, 0.95);
}

.form-textarea::placeholder {
  color: #9ab;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.cancel-btn, .submit-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cancel-btn {
  background: linear-gradient(135deg, #3a4553 0%, #4a5563 100%);
  color: #9ab;
}

.cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 85, 99, 0.3);
}

.submit-btn {
  background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
  color: #14181c;
  box-shadow: 0 4px 15px rgba(0, 212, 170, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 170, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  margin-top: 1rem;
}
</style>