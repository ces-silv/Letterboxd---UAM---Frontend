<template>
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">{{ $t('admin.directors.title') }}</h2>
      <form class="inline-form" @submit.prevent="createDirector">
        <input v-model="directorForm.director_name" type="text" :placeholder="$t('admin.directors.placeholder')" required class="input" />
        <button class="btn primary" type="submit" :disabled="creatingDirector">{{ creatingDirector ? $t('admin.directors.creating') : $t('admin.directors.create') }}</button>
      </form>
    </div>
    <div v-if="directorsError" class="error">{{ directorsError }}</div>
    <div class="items-list">
      <div v-for="d in directors" :key="d.id || d.director_id" class="item-row">
        <div class="title">{{ d.name || d.director_name }}</div>
        <div class="actions">
          <button class="btn danger outline" @click="confirmDelete(d)" v-if="canDelete">{{ $t('admin.movies.delete') }}</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDelete">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ $t('admin.directors.deleteModal.title') }}</h3>
          <button class="modal-close-btn" @click="closeDelete">×</button>
        </div>
        <div class="modal-body">
          <p>{{ $t('admin.directors.deleteModal.confirm', { name: deleteName }) }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn outline" @click="closeDelete" :disabled="deleting">{{ $t('admin.directors.deleteModal.cancel') }}</button>
          <button class="btn primary" @click="performDelete" :disabled="deleting">{{ deleting ? $t('admin.directors.deleteModal.deleting') : $t('admin.directors.deleteModal.delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import adminService from '../../services/adminService'

export default {
  name: 'DirectorsSection',
  props: {
    active: { type: Boolean, default: false },
    showToast: { type: Function, required: true },
    canDelete: { type: Boolean, default: true }
  },
  data() {
    return {
      loaded: false,
      directors: [],
      directorForm: { director_name: '' },
      creatingDirector: false,
      directorsError: null,
      showDeleteModal: false,
      deleting: false,
      deleteId: null,
      deleteName: ''
    }
  },
  watch: {
    active(val) { if (val && !this.loaded) this.init() }
  },
  mounted() { if (this.active && !this.loaded) this.init() },
  methods: {
    async init() {
      try {
        const res = await adminService.listDirectors({ per_page: 20 })
        this.directors = res.data.data || res.data || []
        this.loaded = true
      } catch (e) {
        this.directorsError = e.response?.data?.message || e.message
      }
    },
    async createDirector() {
      this.creatingDirector = true
      this.directorsError = null
      try {
        await adminService.createDirector(this.directorForm)
        this.directorForm = { director_name: '' }
        const res = await adminService.listDirectors({ per_page: 20 })
        this.directors = res.data.data || res.data || []
        this.showToast(this.$t('admin.directors.toast.created'), 'success')
      } catch (e) {
        const msg = e.response?.data?.message || e.message
        this.directorsError = msg
        this.showToast(msg, 'error')
      } finally {
        this.creatingDirector = false
      }
    },
    confirmDelete(d) {
      this.deleteId = d.id || d.director_id
      this.deleteName = d.name || d.director_name || ''
      this.showDeleteModal = true
    },
    closeDelete() {
      if (this.deleting) return
      this.showDeleteModal = false
      this.deleteId = null
      this.deleteName = ''
    },
    async performDelete() {
      const id = this.deleteId
      if (!id) return
      this.deleting = true
      this.closeDelete()
      try {
        await adminService.deleteDirector(id)
        this.directors = this.directors.filter((x) => (x.id || x.director_id) !== id)
        this.showToast(this.$t('admin.directors.toast.deleted'), 'success')
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
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.section-title { font-size: 1.5rem; font-weight: 700; color: #fff; }
.inline-form { display: flex; gap: 0.5rem; align-items: center; }
.input { width: 280px; padding: 0.75rem 1rem; border: 2px solid #3a4553; border-radius: 10px; background-color: rgba(26, 32, 44, 0.8); color: #fff; }
.btn { border: none; padding: 0.625rem 1rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn.primary { background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); color: #14181c; }
.btn.outline { background: transparent; border: 2px solid rgba(255,255,255,0.12); color: #9ab; }
.btn.danger { color: #ff6b6b; border-color: #ff6b6b; }
.items-list { display: flex; flex-direction: column; gap: 0.5rem; }
.item-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid #3a4553; border-radius: 12px; background: rgba(26,32,44,0.5); }
.title { font-weight: 600; color: #fff; }
.error { color: #ff6b6b; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-container { width: 100%; max-width: 520px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, #2c3440 0%, #1a202c 100%); overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.modal-close-btn { background: transparent; border: none; color: #9ab; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 1rem; color: #cbd5e1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.75rem 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
</style>
