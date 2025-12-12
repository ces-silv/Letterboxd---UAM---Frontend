<template>
  <div v-if="isLoggedIn" class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">{{ $t('admin.header.title') }}</div>
      <button :class="['sidebar-item', { active: activeSection === 'movies' }]" @click="setSection('movies')">{{ $t('admin.sidebar.movies') }}</button>
      <button :class="['sidebar-item', { active: activeSection === 'directors' }]" @click="setSection('directors')">{{ $t('admin.sidebar.directors') }}</button>
      <button :class="['sidebar-item', { active: activeSection === 'actors' }]" @click="setSection('actors')">{{ $t('admin.sidebar.actors') }}</button>
      <button :class="['sidebar-item', { active: activeSection === 'genres' }]" @click="setSection('genres')">{{ $t('admin.sidebar.genres') }}</button>
      <button :class="['sidebar-item', { active: activeSection === 'casts' }]" @click="setSection('casts')">{{ $t('admin.sidebar.casts') }}</button>
    </aside>
    <section class="admin-content">
      <MoviesSection
        v-if="activeSection === 'movies'"
        :active="activeSection === 'movies'"
        :showToast="showToast"
      />
      <DirectorsSection
        v-if="activeSection === 'directors'"
        :active="activeSection === 'directors'"
        :showToast="showToast"
      />
      <ActorsSection
        v-if="activeSection === 'actors'"
        :active="activeSection === 'actors'"
        :showToast="showToast"
      />
      <GenresSection
        v-if="activeSection === 'genres'"
        :active="activeSection === 'genres'"
        :showToast="showToast"
      />
      <CastsSection
        v-if="activeSection === 'casts'"
        :active="activeSection === 'casts'"
        :showToast="showToast"
      />
    </section>
  </div>
  <div v-else class="error">{{ $t('admin.mustLogin') }}</div>

  <div class="toast-container">
    <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
      <span>{{ t.message }}</span>
      <button class="toast-close" @click="removeToast(t.id)">×</button>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const MoviesSection = defineAsyncComponent(() => import('./admin/MoviesSection.vue'))
const DirectorsSection = defineAsyncComponent(() => import('./admin/DirectorsSection.vue'))
const ActorsSection = defineAsyncComponent(() => import('./admin/ActorsSection.vue'))
const GenresSection = defineAsyncComponent(() => import('./admin/GenresSection.vue'))
const CastsSection = defineAsyncComponent(() => import('./admin/CastsSection.vue'))

export default {
  name: 'AdminDashboard',
  components: { MoviesSection, DirectorsSection, ActorsSection, GenresSection, CastsSection },
  data() {
    return {
      activeSection: 'movies',
      toasts: [],
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    },
  },
  methods: {
    setSection(s) { this.activeSection = s },
    showToast(message, type = 'success') {
      const id = Date.now() + Math.random()
      this.toasts.push({ id, message, type })
      setTimeout(() => this.removeToast(id), 4500)
    },
    removeToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    }
  },
}
</script>

<style scoped>
.admin-layout { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; color: #fff; }
.sidebar { background: linear-gradient(135deg, #1f2530 0%, #14181c 100%); border-right: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; }
.sidebar-header { color: #00d4aa; font-weight: 800; font-size: 1.25rem; margin-bottom: 1rem; }
.sidebar-item { width: 100%; text-align: left; background: transparent; border: none; color: #cbd5e1; padding: 0.75rem 1rem; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.15s ease; }
.sidebar-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
.sidebar-item.active { background: rgba(0,212,170,0.12); color: #00d4aa; box-shadow: 0 1px 2px rgba(0,0,0,0.25); }
.admin-content { padding: 2rem; }
.error { color: #ff6b6b; margin-top: 1rem; }

.toast-container { position: fixed; top: 1rem; right: 1rem; display: flex; flex-direction: column; gap: 0.5rem; z-index: 1100; }
.toast { display: flex; align-items: center; gap: 0.75rem; background: linear-gradient(135deg, #2c3440 0%, #1a202c 100%); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 0.75rem 1rem; box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
.toast.success { border-color: rgba(0,212,170,0.35); }
.toast.error { border-color: rgba(255,107,107,0.35); }
.toast-close { background: transparent; border: none; color: #9ab; font-size: 1rem; cursor: pointer; }
</style>
