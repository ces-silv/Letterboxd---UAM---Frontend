<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>{{ $t('auth.login.title') }}</h2>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">{{ $t('auth.login.email') }}</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="password">{{ $t('auth.login.password') }}</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="form-input"
          />
        </div>
        <button type="submit" :disabled="loading" class="auth-button">
          {{ loading ? $t('auth.login.loading') : $t('auth.login.submit') }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <p class="auth-link">
        {{ $t('auth.login.link') }}
        <router-link to="/register">{{ $t('auth.login.linkText') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '../config'

export default {
  name: 'LoginForm',
  data() {
    return {
      form: {
        email: '',
        password: ''
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
    async handleLogin() {
      this.loading = true
      this.error = null
      this.currentError = null
      try {
        const response = await axios.post(API_ENDPOINTS.LOGIN, this.form)
        localStorage.setItem('token', response.data.token)
        this.$router.push('/')
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
          this.error = response?.message || 'Login failed'
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
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #14181c 0%, #0a0c0f 100%);
  padding: 2rem 1rem;
}

.auth-card {
  background: linear-gradient(135deg, #2c3440 0%, #1a202c 100%);
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 212, 170, 0.1);
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}

.auth-card h2 {
  text-align: center;
  margin-bottom: 2.5rem;
  color: #00d4aa;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: #9ab;
  font-weight: 600;
  font-size: 0.95rem;
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

.auth-button {
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

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 170, 0.4);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  font-weight: 500;
}

.auth-link {
  text-align: center;
  margin-top: 2rem;
  color: #9ab;
  font-size: 0.95rem;
}

.auth-link a {
  color: #00d4aa;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.auth-link a:hover {
  color: #00b894;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
    border-radius: 16px;
  }

  .auth-card h2 {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }

  .form-input {
    padding: 0.875rem 1rem;
  }

  .auth-button {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>