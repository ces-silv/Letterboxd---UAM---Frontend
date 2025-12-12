<template>
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">{{ $t('admin.actors.title') }}</h2>
      <form class="inline-form" @submit.prevent="createActor">
        <input v-model="actorForm.actor_name" type="text" :placeholder="$t('admin.actors.placeholder')" required class="input" />
        <button class="btn primary" type="submit" :disabled="creatingActor">{{ creatingActor ? $t('admin.actors.creating') : $t('admin.actors.create') }}</button>
      </form>
    </div>
    <div v-if="actorsError" class="error">{{ actorsError }}</div>
    <div class="items-list">
      <div v-for="a in actors" :key="a.id || a.actor_id" class="item-row">
        <div class="title">{{ a.name || a.actor_name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import adminService from '../../services/adminService'

export default {
  name: 'ActorsSection',
  props: {
    active: { type: Boolean, default: false },
    showToast: { type: Function, required: true }
  },
  data() {
    return {
      loaded: false,
      actors: [],
      actorForm: { actor_name: '' },
      creatingActor: false,
      actorsError: null
    }
  },
  watch: { active(val) { if (val && !this.loaded) this.init() } },
  mounted() { if (this.active && !this.loaded) this.init() },
  methods: {
    async init() {
      try {
        const res = await adminService.listActors({ per_page: 20 })
        this.actors = res.data.data || res.data || []
        this.loaded = true
      } catch (e) {
        this.actorsError = e.response?.data?.message || e.message
      }
    },
    async createActor() {
      this.creatingActor = true
      this.actorsError = null
      try {
        await adminService.createActor(this.actorForm)
        this.actorForm = { actor_name: '' }
        const res = await adminService.listActors({ per_page: 20 })
        this.actors = res.data.data || res.data || []
        this.showToast(this.$t('admin.actors.toast.created'), 'success')
      } catch (e) {
        const msg = e.response?.data?.message || e.message
        this.actorsError = msg
        this.showToast(msg, 'error')
      } finally {
        this.creatingActor = false
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
