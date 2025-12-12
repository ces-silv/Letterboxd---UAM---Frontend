<template>
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">{{ $t('admin.genres.title') }}</h2>
      <form class="inline-form" @submit.prevent="createGenre">
        <input v-model="genreForm.genre_name" type="text" :placeholder="$t('admin.genres.placeholder')" required class="input" />
        <button class="btn primary" type="submit" :disabled="creatingGenre">{{ creatingGenre ? $t('admin.genres.creating') : $t('admin.genres.create') }}</button>
      </form>
    </div>
    <div v-if="genresError" class="error">{{ genresError }}</div>
    <div class="items-list">
      <div v-for="g in genres" :key="g.id || g.genre_id" class="item-row">
        <div class="title">{{ g.genre || g.genre_name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import adminService from '../../services/adminService'

export default {
  name: 'GenresSection',
  props: {
    active: { type: Boolean, default: false },
    showToast: { type: Function, required: true }
  },
  data() {
    return {
      loaded: false,
      genres: [],
      genreForm: { genre_name: '' },
      creatingGenre: false,
      genresError: null
    }
  },
  watch: { active(val) { if (val && !this.loaded) this.init() } },
  mounted() { if (this.active && !this.loaded) this.init() },
  methods: {
    async init() {
      try {
        const res = await adminService.listGenres({ per_page: 20 })
        this.genres = res.data.data || res.data || []
        this.loaded = true
      } catch (e) {
        this.genresError = e.response?.data?.message || e.message
      }
    },
    async createGenre() {
      this.creatingGenre = true
      this.genresError = null
      try {
        await adminService.createGenre(this.genreForm)
        this.genreForm = { genre_name: '' }
        const res = await adminService.listGenres({ per_page: 20 })
        this.genres = res.data.data || res.data || []
        this.showToast(this.$t('admin.genres.toast.created'), 'success')
      } catch (e) {
        const msg = e.response?.data?.message || e.message
        this.genresError = msg
        this.showToast(msg, 'error')
      } finally {
        this.creatingGenre = false
      }
    }
  }
}
</script>

<style scoped>
.section { display: flex; flex-direction: column; gap: 1rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.section-title { font-size: 1.5rem; font-weight: 700; color: #fff; }
.inline-form { display: flex; gap: 0.5rem; align-items: center; }
.input { width: 280px; padding: 0.75rem 1rem; border: 2px solid #3a4553; border-radius: 10px; background-color: rgba(26, 32, 44, 0.8); color: #fff; }
.btn { border: none; padding: 0.625rem 1rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn.primary { background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); color: #14181c; }
.items-list { display: flex; flex-direction: column; gap: 0.5rem; }
.item-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid #3a4553; border-radius: 12px; background: rgba(26,32,44,0.5); }
.title { font-weight: 600; color: #fff; }
.error { color: #ff6b6b; }
</style>
