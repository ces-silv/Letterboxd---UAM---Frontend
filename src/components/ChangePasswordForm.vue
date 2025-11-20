<template>
  <div class="change-password">
    <h3>{{ $t('profile.changePassword') || 'Cambiar contraseña' }}</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="current_password">{{ $t('profile.currentPassword') || 'Contraseña actual' }}</label>
        <input id="current_password" v-model="form.current_password" :type="showCurrent ? 'text' : 'password'" required class="form-input" />
        <button type="button" class="toggle-btn" @click="showCurrent = !showCurrent">{{ showCurrent ? ($t('common.hide') || 'Ocultar') : ($t('common.show') || 'Mostrar') }}</button>
      </div>
      <div class="form-group">
        <label for="new_password">{{ $t('profile.newPassword') || 'Nueva contraseña' }}</label>
        <input id="new_password" v-model="form.new_password" :type="showNew ? 'text' : 'password'" required class="form-input" />
        <button type="button" class="toggle-btn" @click="showNew = !showNew">{{ showNew ? ($t('common.hide') || 'Ocultar') : ($t('common.show') || 'Mostrar') }}</button>
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="loading" class="submit-btn">{{ loading ? ($t('profile.saving') || 'Guardando...') : ($t('profile.save') || 'Guardar') }}</button>
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
    </form>
  </div>
</template>

<script>
import authService from '../services/authService'

export default {
  name: 'ChangePasswordForm',
  data() {
    return {
      form: { current_password: '', new_password: '' },
      loading: false,
      error: null,
      success: null,
      showCurrent: false,
      showNew: false
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      this.error = null
      this.success = null
      try {
        await authService.changePassword(this.form)
        this.success = this.$t('profile.passwordChanged') || 'Contraseña cambiada exitosamente'
        this.form.current_password = ''
        this.form.new_password = ''
      } catch (error) {
        const response = error.response?.data
        this.error = response?.message || 'Error al cambiar la contraseña'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.change-password { margin-top: 2rem; }
.form-group { margin-bottom: 1.5rem; position: relative; }
.form-input { width: 100%; padding: 1rem 1.25rem; border: 2px solid #3a4553; border-radius: 12px; background-color: rgba(26, 32, 44, 0.8); color: #fff; }
.toggle-btn { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: transparent; color: #9ab; border: none; cursor: pointer; }
.form-actions { display: flex; justify-content: flex-end; }
.submit-btn { background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); color: #14181c; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; }
.error-message { color: #ff6b6b; }
.success-message { color: #00d4aa; }
</style>