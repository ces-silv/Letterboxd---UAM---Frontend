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
      return !!this.existingReview
    }
  },
  mounted() {
    if (this.isEditing) {
      this.rating = this.existingReview.rating
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

        if (this.isEditing) {
          await axios.put(`http://localhost:8000/api/reviews/${this.existingReview.id}`, reviewData, {
            headers: { Authorization: `Bearer ${token}` }
          })
        } else {
          await axios.post('http://localhost:8000/api/reviews', reviewData, {
            headers: { Authorization: `Bearer ${token}` }
          })
        }

        this.$emit('review-submitted')
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to submit review'
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
  transition: color 0.3s ease;
}

.star.active {
  color: #00d4aa;
}

.star:hover {
  color: #00b894;
}

.rating-text {
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #3a4553;
  border-radius: 4px;
  background-color: #1a202c;
  color: #fff;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: #00d4aa;
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
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-btn {
  background-color: #3a4553;
  color: #9ab;
}

.cancel-btn:hover {
  background-color: #4a5563;
}

.submit-btn {
  background-color: #00d4aa;
  color: #14181c;
}

.submit-btn:hover:not(:disabled) {
  background-color: #00b894;
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