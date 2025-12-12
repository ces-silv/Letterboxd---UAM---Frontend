<template>
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">{{ $t('admin.casts.title') }}</h2>
    </div>
    <form class="grid four-cols" @submit.prevent="createCast">
      <select v-model.number="castForm.movie_id" required class="input">
        <option :value="null">{{ $t('admin.casts.selectMovie') }}</option>
        <option v-for="m in movies" :key="m.id" :value="m.id">{{ m.title }}</option>
      </select>
      <select v-model.number="castForm.actor_id" required class="input">
        <option :value="null">{{ $t('admin.casts.selectActor') }}</option>
        <option v-for="a in actors" :key="a.id || a.actor_id" :value="a.id || a.actor_id">{{ a.name || a.actor_name }}</option>
      </select>
      <input v-model="castForm.character_name" type="text" :placeholder="$t('admin.casts.placeholderCharacter')" required class="input" />
      <button type="submit" class="btn primary" :disabled="creatingCast">{{ creatingCast ? $t('admin.casts.creating') : $t('admin.casts.create') }}</button>
    </form>
    <div v-if="castsError" class="error">{{ castsError }}</div>
    <div class="items-list">
      <div v-for="c in casts" :key="c.id || (c.movie_id+'-'+c.actor_id)" class="item-row">
        <div class="title">{{ c.character_name }}</div>
        <div class="meta">{{ getMovieTitle(c.movie_id) }} · {{ getActorName(c.actor_id) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import adminService from '../../services/adminService'
import moviesService from '../../services/moviesService'

export default {
  name: 'CastsSection',
  props: {
    active: { type: Boolean, default: false },
    showToast: { type: Function, required: true }
  },
  data() {
    return {
      loaded: false,
      casts: [],
      castsError: null,
      creatingCast: false,
      castForm: { movie_id: null, actor_id: null, character_name: '' },
      movies: [],
      actors: []
    }
  },
  watch: { active(val) { if (val && !this.loaded) this.init() } },
  mounted() { if (this.active && !this.loaded) this.init() },
  methods: {
    async init() {
      try {
        const [castsRes, moviesRes, actorsRes] = await Promise.all([
          adminService.listCasts({ per_page: 20 }),
          moviesService.list({ per_page: 50 }),
          adminService.listActors({ per_page: 50 })
        ])
        this.casts = castsRes.data.data || castsRes.data || []
        this.movies = moviesRes.data.data || []
        this.actors = actorsRes.data.data || actorsRes.data || []
        this.loaded = true
      } catch (e) {
        this.castsError = e.response?.data?.message || e.message
      }
    },
    async createCast() {
      this.creatingCast = true
      this.castsError = null
      try {
        await adminService.createMovieCast(this.castForm)
        this.castForm = { movie_id: null, actor_id: null, character_name: '' }
        const res = await adminService.listCasts({ per_page: 20 })
        this.casts = res.data.data || res.data || []
        this.showToast(this.$t('admin.casts.toast.created'), 'success')
      } catch (e) {
        const msg = e.response?.data?.message || e.message
        this.castsError = msg
        this.showToast(msg, 'error')
      } finally {
        this.creatingCast = false
      }
    },
    getMovieTitle(id) {
      const m = this.movies.find((x) => x.id === id)
      return m ? (m.title || ('#' + id)) : ('#' + id)
    },
    getActorName(id) {
      const a = this.actors.find((x) => (x.id || x.actor_id) === id)
      return a ? (a.name || a.actor_name || ('#' + id)) : ('#' + id)
    }
  }
}
</script>

<style scoped>
.section { display: flex; flex-direction: column; gap: 1rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.section-title { font-size: 1.5rem; font-weight: 700; color: #fff; }
.grid.four-cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
.input { width: 100%; padding: 0.75rem 1rem; border: 2px solid #3a4553; border-radius: 10px; background-color: rgba(26, 32, 44, 0.8); color: #fff; }
.btn { border: none; padding: 0.625rem 1rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn.primary { background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); color: #14181c; }
.items-list { display: flex; flex-direction: column; gap: 0.5rem; }
.item-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid #3a4553; border-radius: 12px; background: rgba(26,32,44,0.5); }
.title { font-weight: 600; color: #fff; }
.meta { font-size: 0.9rem; color: #9ab; }
.error { color: #ff6b6b; }
@media (max-width: 720px) {
  .grid.four-cols { grid-template-columns: 1fr; }
}
</style>
