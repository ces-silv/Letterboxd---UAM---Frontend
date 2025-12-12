<template>
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">{{ $t('admin.movies.title') }}</h2>
      <button class="btn primary" @click="openCreate">{{ $t('admin.movies.new') }}</button>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div class="items-list">
      <div v-for="m in movies" :key="m.id" class="item-row">
        <div>
          <div class="title">{{ m.title }}</div>
          <div class="meta">{{ formatDate(m.release_date) }}</div>
        </div>
        <div class="actions">
          <button class="btn outline" @click="openEdit(m)">{{ $t('admin.movies.edit') }}</button>
          <button class="btn danger outline" @click="confirmDelete(m)">{{ $t('admin.movies.delete') }}</button>
        </div>
      </div>
    </div>

    <MovieModal
      :isOpen="showCreate"
      :directors="directors"
      :creating="creating"
      @close="showCreate=false"
      @submit="createMovie"
      :titleText="$t('admin.movies.modal.createTitle')"
      :submitLabel="$t('admin.movies.modal.createSubmit')"
      :submitLoadingText="$t('admin.movies.modal.creating')"
    />

    <MovieModal
      :isOpen="showEdit"
      :directors="directors"
      :creating="updating"
      @close="closeEdit"
      @submit="updateMovieSubmit"
      :initialForm="editForm"
      :titleText="$t('admin.movies.modal.editTitle')"
      :submitLabel="$t('admin.movies.modal.editSubmit')"
      :submitLoadingText="$t('admin.movies.modal.updating')"
    />

    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDelete">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ $t('admin.movies.deleteModal.title') }}</h3>
          <button class="modal-close-btn" @click="closeDelete">×</button>
        </div>
        <div class="modal-body">
          <p>{{ $t('admin.movies.deleteModal.confirm', { title: deleteMovieTitle }) }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn outline" @click="closeDelete" :disabled="deleting">{{ $t('admin.movies.deleteModal.cancel') }}</button>
          <button class="btn primary" @click="performDelete" :disabled="deleting">{{ deleting ? $t('admin.movies.deleteModal.deleting') : $t('admin.movies.deleteModal.delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moviesService from '../../services/moviesService'
import adminService from '../../services/adminService'
import MovieModal from '../MovieModal.vue'

export default {
  name: 'MoviesSection',
  components: { MovieModal },
  props: {
    active: { type: Boolean, default: false },
    showToast: { type: Function, required: true }
  },
  data() {
    return {
      loaded: false,
      loading: false,
      error: null,
      movies: [],
      directors: [],
      creating: false,
      showCreate: false,
      showEdit: false,
      updating: false,
      editId: null,
      editForm: { title: '', release_date: '', director_id: null, duration: null, synopsis: '', poster: null },
      showDeleteModal: false,
      deleting: false,
      deleteMovieId: null,
      deleteMovieTitle: ''
    }
  },
  watch: {
    active(val) {
      if (val && !this.loaded) this.init()
    }
  },
  mounted() {
    if (this.active && !this.loaded) this.init()
  },
  methods: {
    async init() {
      this.loading = true
      try {
        const [moviesRes, directorsRes] = await Promise.all([
          moviesService.list({ per_page: 20 }),
          adminService.listDirectors({ per_page: 20 })
        ])
        this.movies = moviesRes.data.data || []
        this.directors = directorsRes.data.data || directorsRes.data || []
        this.loaded = true
      } catch (e) {
        this.error = e.response?.data?.message || e.message
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      const d = new Date(dateString)
      return d.toLocaleDateString()
    },
    openCreate() {
      this.showCreate = true
    },
    async createMovie(payload) {
      this.creating = true
      this.error = null
      try {
        const fd = new FormData()
        fd.append('title', payload.title)
        fd.append('release_date', payload.release_date)
        fd.append('director_id', String(payload.director_id))
        fd.append('duration', String(payload.duration))
        fd.append('synopsis', payload.synopsis || '')
        if (payload.poster) fd.append('poster', payload.poster)
        await adminService.createMovie(fd)
        const res = await moviesService.list({ per_page: 20 })
        this.movies = res.data.data || []
        this.showToast(this.$t('admin.movies.toast.created'), 'success')
        this.showCreate = false
      } catch (e) {
        const msg = e.response?.data?.message || e.message
        this.error = msg
        this.showToast(msg, 'error')
      } finally {
        this.creating = false
      }
    },
    openEdit(m) {
      this.editId = m.id
      this.editForm = {
        title: m.title || '',
        release_date: this.formatDateInput(m.release_date),
        director_id: m.director_id || null,
        duration: m.duration || null,
        synopsis: m.synopsis || '',
        poster: null,
        poster_path: m.poster_path || null
      }
      this.showEdit = true
    },
    formatDateInput(dateString) {
      if (!dateString) return ''
      if (typeof dateString === 'string' && dateString.length >= 10) return dateString.slice(0, 10)
      try {
        const d = new Date(dateString)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${dd}`
      } catch { return '' }
    },
    closeEdit() {
      this.showEdit = false
      this.updating = false
      this.editId = null
    },
    async updateMovieSubmit(payload) {
      if (!this.editId) return
      this.updating = true
      try {
        const fd = new FormData()
        fd.append('title', payload.title)
        fd.append('release_date', payload.release_date)
        fd.append('director_id', String(payload.director_id))
        fd.append('duration', String(payload.duration))
        fd.append('synopsis', payload.synopsis || '')
        if (payload.poster) fd.append('poster', payload.poster)
        await adminService.updateMovie(this.editId, fd)
        const res = await moviesService.list({ per_page: 20 })
        this.movies = res.data.data || []
        this.showToast(this.$t('admin.movies.toast.updated'), 'success')
        this.closeEdit()
      } catch (e) {
        const msg = e.response?.data?.message || e.message
        this.showToast(msg, 'error')
      } finally {
        this.updating = false
      }
    },
    confirmDelete(m) {
      this.deleteMovieId = m.id
      this.deleteMovieTitle = m.title
      this.showDeleteModal = true
    },
    closeDelete() {
      if (this.deleting) return
      this.showDeleteModal = false
      this.deleteMovieId = null
      this.deleteMovieTitle = ''
    },
    async performDelete() {
      const id = this.deleteMovieId
      if (!id) return
      this.deleting = true
      this.closeDelete()
      try {
        await adminService.deleteMovie(id)
        this.movies = this.movies.filter((x) => x.id !== id)
        this.showToast(this.$t('admin.movies.toast.deleted'), 'success')
      } catch (e) {
        const msg = e.response?.data?.message || e.message
        this.showToast(msg, 'error')
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>

<style scoped>
.section { display: flex; flex-direction: column; gap: 1rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-size: 1.5rem; font-weight: 700; color: #fff; }
.items-list { display: flex; flex-direction: column; gap: 0.5rem; }
.item-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid #3a4553; border-radius: 12px; background: rgba(26,32,44,0.5); }
.title { font-weight: 600; color: #fff; }
.meta { font-size: 0.9rem; color: #9ab; }
.actions { display: flex; gap: 0.5rem; }
.btn { border: none; padding: 0.625rem 1rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn.primary { background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); color: #14181c; }
.btn.outline { background: transparent; border: 2px solid rgba(255,255,255,0.12); color: #9ab; }
.btn.danger { color: #ff6b6b; border-color: #ff6b6b; }
.error { color: #ff6b6b; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-container { width: 100%; max-width: 520px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, #2c3440 0%, #1a202c 100%); overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.modal-close-btn { background: transparent; border: none; color: #9ab; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 1rem; color: #cbd5e1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.75rem 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
</style>
