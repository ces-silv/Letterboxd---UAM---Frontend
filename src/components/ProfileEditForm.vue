<template>
  <div class="profile-edit-form">
    <h3>{{ $t('profile.editProfile') }}</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">{{ $t('profile.username') }}</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          class="form-input"
        />
      </div>
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="cancel-btn">
          {{ $t('profile.cancel') }}
        </button>
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? $t('profile.saving') : $t('profile.save') }}
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
  name: 'ProfileEditForm',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  emits: ['profile-updated', 'cancel'],
  data() {
    return {
      form: {
        username: ''
      },
      loading: false,
      error: null,
      currentError: null
    }
  },
  mounted() {
    this.$watch(
      () => this.$i18n.locale,
      () => {
        if (this.currentError) {
          this.updateErrorMessage()
        }
      }
    )
    this.form.username = this.user.username
  },
  methods: {
    updateErrorMessage() {
      if (this.currentError) {
        if (typeof this.currentError === 'object') {
          this.error = this.currentError[this.$i18n.locale] || this.currentError.en || this.currentError.es
        } else {
          this.error = this.currentError
        }
      }
    },
    async handleSubmit() {
      this.loading = true
      this.error = null
      this.currentError = null

      try {
        const token = localStorage.getItem('token')
        await axios.put(API_ENDPOINTS.EDIT_USER, this.form, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.$emit('profile-updated')
      } catch (error) {
        const response = error.response?.data
        if (response?.errors && typeof response.errors === 'object') {
          const firstField = Object.keys(response.errors)[0]
          const firstError = response.errors[firstField]

          this.currentError = firstError

          if (firstError && typeof firstError === 'object') {
            this.error = firstError[this.$i18n.locale] || firstError.en || firstError.es || 'Validation error'
          } else if (typeof firstError === 'string') {
            this.error = firstError
          } else {
            this.error = 'Validation error'
          }
        } else {
          this.error = response?.message || 'Failed to update profile'
          this.currentError = null
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.profile-edit-form {
  max-width: 500px;
  margin: 0 auto;
}

.profile-edit-form h3 {
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

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #3a4553;
  border-radius: 12px;
  background-color: rgba(26, 32, 44, 0.8);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-input:focus {
  outline: none;
  border-color: #00d4aa;
  box-shadow: 0 0 20px rgba(0, 212, 170, 0.2);
  background-color: rgba(26, 32, 44, 0.95);
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