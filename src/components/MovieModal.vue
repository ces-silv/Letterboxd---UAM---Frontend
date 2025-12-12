<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">{{ titleText }}</h3>
        <button class="modal-close-btn" @click="handleClose" aria-label="Cerrar modal">×</button>
      </div>
      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="grid two-cols">
          <div class="field">
            <label class="label" for="title">Título</label>
            <input id="title" v-model="form.title" type="text" placeholder="Título de la película" required class="input" />
          </div>
          <div class="field">
            <label class="label" for="release_date">Fecha de estreno</label>
            <input id="release_date" v-model="form.release_date" type="date" required class="input" />
          </div>
          <div class="field">
            <label class="label" for="director">Director</label>
            <select id="director" v-model.number="form.director_id" required class="input">
              <option :value="null">Selecciona un director</option>
              <option v-for="d in directors" :key="d.id || d.director_id" :value="d.id || d.director_id">
                {{ d.name || d.director_name }}
              </option>
            </select>
          </div>
          <div class="field">
            <label class="label" for="duration">Duración (minutos)</label>
            <input id="duration" v-model.number="form.duration" type="number" placeholder="120" required class="input" />
          </div>
        </div>

        <div class="field">
          <label class="label" for="synopsis">Sinopsis</label>
          <textarea id="synopsis" v-model="form.synopsis" rows="3" placeholder="Escribe una breve sinopsis..." class="input"></textarea>
        </div>

        <div class="field">
          <label class="label">Póster</label>
          <div
            class="dropzone"
            :class="{ active: posterDropActive }"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
          >
            <template v-if="!posterPreviewUrl">
              <label class="dropzone-label">
                <div class="drop-icon">↑</div>
                <p class="drop-title">Arrastra y suelta el póster aquí</p>
                <p class="drop-sub">o haz clic para seleccionar</p>
                <input ref="fileInput" type="file" accept="image/*" @change="onSelect" class="hidden-file" />
              </label>
            </template>
            <template v-else>
              <div ref="cropContainer" class="cropper" @mousedown="onCropMouseDown">
                <img ref="posterImg" :src="posterPreviewUrl" alt="Preview" class="crop-image" />
                <div v-if="cropRectVisible" class="crop-rect" :style="cropRectStyle"></div>
              </div>
              <div class="crop-controls">
                <button type="button" class="btn outline" @click="startCropMode">Seleccionar recorte</button>
                <button type="button" class="btn outline" :disabled="!cropReady" @click="applyCrop">Aplicar recorte</button>
                <button type="button" class="btn danger outline" @click="clearPoster">Quitar imagen</button>
              </div>
            </template>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn outline" @click="handleClose">Cancelar</button>
          <button type="submit" class="btn primary" :disabled="creating">{{ creating ? submitLoadingText : submitLabel }}</button>
        </div>
      </form>
    </div>
  </div>
  </template>

<script>
import { API_BASE_URL } from '../config'
export default {
  name: 'MovieModal',
  props: {
    isOpen: { type: Boolean, required: true },
    directors: { type: Array, default: () => [] },
    creating: { type: Boolean, default: false },
    initialForm: {
      type: Object,
      default: () => ({ title: '', release_date: '', director_id: null, duration: null, synopsis: '', poster: null, poster_path: null })
    },
    titleText: { type: String, default: 'Nueva película' },
    submitLabel: { type: String, default: 'Crear película' },
    submitLoadingText: { type: String, default: 'Creando...' }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      form: { title: '', release_date: '', director_id: null, duration: null, synopsis: '', poster: null },
      posterPreviewUrl: null,
      posterPreviewIsBlob: false,
      posterDropActive: false,
      cropActive: false,
      cropReady: false,
      cropRectVisible: false,
      cropRectStyle: {},
    }
  },
  watch: {
    isOpen(val) {
      if (val) {
        document.body.style.overflow = 'hidden'
        this.prefill(this.initialForm)
      } else {
        document.body.style.overflow = 'unset'
      }
    },
    initialForm: {
      handler(n) { if (this.isOpen) this.prefill(n) },
      deep: true
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
    document.body.style.overflow = 'unset'
  },
  methods: {
    onKey(e) {
      if (e.key === 'Escape' && this.isOpen) this.handleClose()
    },
    prefill(f) {
      const copy = { ...f }
      copy.release_date = this.formatDateInput(copy.release_date)
      this.form = { ...this.form, ...copy }
      if (this.posterPreviewUrl && this.posterPreviewIsBlob) {
        URL.revokeObjectURL(this.posterPreviewUrl)
      }
      this.posterPreviewUrl = null
      this.posterPreviewIsBlob = false
      this.cropActive = false
      this.cropReady = false
      this.cropRectVisible = false
      if (copy.poster_path) {
        const resolved = this.resolvePosterUrl(copy.poster_path)
        this.posterPreviewUrl = resolved
        this.posterPreviewIsBlob = false
      }
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
    resolvePosterUrl(p) {
      if (!p) return null
      try {
        const apiOrigin = (() => { try { return new URL(API_BASE_URL).origin } catch (e) { return API_BASE_URL } })()
        if (typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'))) {
          const u = new URL(p)
          const ao = new URL(apiOrigin)
          if (u.origin !== ao.origin) return `${ao.origin}${u.pathname}${u.search}${u.hash}`
          return p
        }
        if (typeof p === 'string' && p.startsWith('/')) return `${apiOrigin}${p}`
        if (typeof p === 'string' && p.startsWith('storage/')) return `${apiOrigin}/${p}`
        return `${apiOrigin}/storage/${p}`
      } catch (e) {
        return p
      }
    },
    handleSubmit() {
      this.$emit('submit', { ...this.form })
      this.resetForm()
    },
    resetForm() {
      this.form = { title: '', release_date: '', director_id: null, duration: null, synopsis: '', poster: null }
      this.clearPoster()
    },
    handleClose() {
      this.resetForm()
      this.$emit('close')
    },
    setPosterFile(file) {
      if (this.posterPreviewUrl && this.posterPreviewIsBlob) {
        URL.revokeObjectURL(this.posterPreviewUrl)
      }
      this.posterPreviewUrl = URL.createObjectURL(file)
      this.posterPreviewIsBlob = true
      this.form.poster = file
      this.cropActive = false
      this.cropReady = false
      this.cropRectVisible = false
    },
    onSelect(e) {
      const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
      if (file && file.type.startsWith('image/')) this.setPosterFile(file)
    },
    onDragOver() { this.posterDropActive = true },
    onDragLeave() { this.posterDropActive = false },
    onDrop(e) {
      this.posterDropActive = false
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0] ? e.dataTransfer.files[0] : null
      if (file && file.type.startsWith('image/')) this.setPosterFile(file)
    },
    clearPoster() {
      if (this.posterPreviewUrl && this.posterPreviewIsBlob) {
        URL.revokeObjectURL(this.posterPreviewUrl)
      }
      this.posterPreviewUrl = null
      this.posterPreviewIsBlob = false
      this.form.poster = null
      this.cropActive = false
      this.cropReady = false
      this.cropRectVisible = false
      const fi = this.$refs.fileInput
      if (fi) fi.value = ''
    },
    startCropMode() {
      this.cropActive = true
      this.cropReady = false
      this.cropRectVisible = false
    },
    onCropMouseDown(e) {
      if (!this.cropActive) return
      const container = this.$refs.cropContainer
      if (!container) return
      const rect = container.getBoundingClientRect()
      const start = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      let crop = { x: start.x, y: start.y, w: 0, h: 0 }
      this.cropRectVisible = true
      const onMove = (ev) => {
        const x = ev.clientX - rect.left
        const y = ev.clientY - rect.top
        const w = x - start.x
        const h = y - start.y
        crop = {
          x: w < 0 ? x : start.x,
          y: h < 0 ? y : start.y,
          w: Math.abs(w),
          h: Math.abs(h)
        }
        this.cropRectStyle = {
          left: crop.x + 'px',
          top: crop.y + 'px',
          width: crop.w + 'px',
          height: crop.h + 'px'
        }
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        this.cropActive = false
        if (crop.w > 10 && crop.h > 10) {
          this.cropReady = true
        } else {
          this.cropRectVisible = false
        }
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    applyCrop() {
      if (!this.cropReady) return
      const img = this.$refs.posterImg
      const container = this.$refs.cropContainer
      if (!img || !container) return
      const displayRect = img.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const scaleX = img.naturalWidth / displayRect.width
      const scaleY = img.naturalHeight / displayRect.height
      const offsetX = displayRect.left - containerRect.left
      const offsetY = displayRect.top - containerRect.top
      const style = this.cropRectStyle
      const sx = (parseFloat(style.left) - offsetX) * scaleX
      const sy = (parseFloat(style.top) - offsetY) * scaleY
      const sw = parseFloat(style.width) * scaleX
      const sh = parseFloat(style.height) * scaleY
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(sw)
      canvas.height = Math.round(sh)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, Math.round(sx), Math.round(sy), Math.round(sw), Math.round(sh), 0, 0, Math.round(sw), Math.round(sh))
      canvas.toBlob((blob) => {
        if (!blob) return
        const file = new File([blob], this.form.poster?.name || 'cropped.jpg', { type: 'image/jpeg' })
        if (this.posterPreviewUrl && this.posterPreviewIsBlob) {
          URL.revokeObjectURL(this.posterPreviewUrl)
        }
        this.posterPreviewUrl = URL.createObjectURL(file)
        this.posterPreviewIsBlob = true
        this.form.poster = file
        this.cropReady = false
        this.cropRectVisible = false
      }, 'image/jpeg', 0.95)
    }
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-container { position: relative; width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, #2c3440 0%, #1a202c 100%); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.modal-header { position: sticky; top: 0; display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(44,52,64,0.95); backdrop-filter: blur(4px); z-index: 10; }
.modal-title { font-size: 1.25rem; font-weight: 700; color: #fff; }
.modal-close-btn { background: transparent; border: none; color: #9ab; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 1.25rem; display: grid; gap: 1rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem; }
.grid.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.375rem; }
.label { font-size: 0.85rem; color: #cbd5e1; }
.input { width: 100%; padding: 0.75rem 1rem; border: 2px solid #3a4553; border-radius: 10px; background-color: rgba(26, 32, 44, 0.8); color: #fff; }
.dropzone { position: relative; border: 2px dashed #3a4553; border-radius: 12px; padding: 1rem; background: rgba(26,32,44,0.5); transition: all 0.2s; }
.dropzone.active { border-color: #00d4aa; background: rgba(0,212,170,0.08); }
.dropzone-label { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.5rem 1rem; cursor: pointer; gap: 0.25rem; }
.drop-icon { width: 48px; height: 48px; border-radius: 12px; border: 2px dashed #3a4553; display:flex; align-items:center; justify-content:center; color:#9ab; margin-bottom: 0.5rem; }
.drop-title { font-weight: 600; color: #fff; }
.drop-sub { font-size: 0.85rem; color: #9ab; }
.hidden-file { display: none; }
.cropper { position: relative; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
.crop-image { width: 100%; display: block; }
.crop-rect { position: absolute; border: 2px solid #00d4aa; background: rgba(0,212,170,0.12); }
.crop-controls { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
.btn { border: none; padding: 0.625rem 1rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn.primary { background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); color: #14181c; }
.btn.outline { background: transparent; border: 2px solid rgba(255,255,255,0.12); color: #9ab; }
.btn.danger { color: #ff6b6b; border-color: #ff6b6b; }
@media (max-width: 720px) {
  .grid.two-cols { grid-template-columns: 1fr; }
}
</style>
