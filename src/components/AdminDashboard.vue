<template>
  <div v-if="isLoggedIn" class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">Administración</div>
      <button :class="['sidebar-item', { active: activeSection === 'movies' }]" @click="setSection('movies')">Películas</button>
      <button :class="['sidebar-item', { active: activeSection === 'directors' }]" @click="setSection('directors')">Directores</button>
      <button :class="['sidebar-item', { active: activeSection === 'actors' }]" @click="setSection('actors')">Actores</button>
      <button :class="['sidebar-item', { active: activeSection === 'genres' }]" @click="setSection('genres')">Géneros</button>
      <button :class="['sidebar-item', { active: activeSection === 'casts' }]" @click="setSection('casts')">Reparto</button>
    </aside>
    <section class="admin-content">
      <div v-if="activeSection === 'movies'">
        <h2>Películas</h2>
        <form @submit.prevent="createMovie" class="form-grid" enctype="multipart/form-data">
          <input v-model="form.title" type="text" placeholder="Título" required class="form-input" />
          <input v-model="form.release_date" type="date" placeholder="Fecha" required class="form-input" />
          <select v-model.number="form.director_id" required class="form-input">
            <option :value="null" disabled>Selecciona un director</option>
            <option v-for="d in directors" :key="d.id || d.director_id" :value="d.id || d.director_id">{{ d.name || d.director_name }}</option>
          </select>
          <input v-model.number="form.duration" type="number" placeholder="Duración" required class="form-input" />
          <input v-model="form.synopsis" type="text" placeholder="Sinopsis" class="form-input" />
           <input
            type="file"
            accept="image/*"
            @change="onPosterChange"
            class="form-input"
          />
          <button type="submit" :disabled="creating" class="submit-btn">{{ creating ? 'Creando...' : 'Crear' }}</button>
        </form>
        <div v-if="error" class="error">{{ error }}</div>
        <div class="items-list">
          <div v-for="m in movies" :key="m.id" class="item-row">
            <div class="left">
              <span class="title">{{ m.title }}</span>
              <span class="meta">{{ formatDate(m.release_date) }}</span>
            </div>
            <div class="right">
              <button @click="deleteMovie(m.id)" class="delete-btn">Eliminar</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeSection === 'directors'">
        <h2>Directores</h2>
        <form @submit.prevent="createDirector" class="form-grid">
          <input v-model="directorForm.director_name" type="text" placeholder="Nombre del director" required class="form-input" />
          <button type="submit" :disabled="creatingDirector" class="submit-btn">{{ creatingDirector ? 'Creando...' : 'Crear director' }}</button>
        </form>
        <div v-if="directorsError" class="error">{{ directorsError }}</div>
        <div class="items-list">
          <div v-for="d in directors" :key="d.id || d.director_id" class="item-row">
            <div class="left">
              <span class="title">{{ d.name || d.director_name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeSection === 'actors'">
        <h2>Actores</h2>
        <form @submit.prevent="createActor" class="form-grid">
          <input v-model="actorForm.actor_name" type="text" placeholder="Nombre del actor" required class="form-input" />
          <button type="submit" :disabled="creatingActor" class="submit-btn">{{ creatingActor ? 'Creando...' : 'Crear actor' }}</button>
        </form>
        <div v-if="actorsError" class="error">{{ actorsError }}</div>
        <div class="items-list">
          <div v-for="a in actors" :key="a.id || a.actor_id" class="item-row">
            <div class="left">
              <span class="title">{{ a.name || a.actor_name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeSection === 'genres'">
        <h2>Géneros</h2>
        <form @submit.prevent="createGenre" class="form-grid">
          <input v-model="genreForm.genre_name" type="text" placeholder="Nombre del género" required class="form-input" />
          <button type="submit" :disabled="creatingGenre" class="submit-btn">{{ creatingGenre ? 'Creando...' : 'Crear género' }}</button>
        </form>
        <div v-if="genresError" class="error">{{ genresError }}</div>
        <div class="items-list">
          <div v-for="g in genres" :key="g.id || g.genre_id" class="item-row">
            <div class="left">
              <span class="title">{{ g.genre || g.genre_name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeSection === 'casts'">
        <h2>Reparto</h2>
        <form @submit.prevent="createCast" class="form-grid">
          <select v-model.number="castForm.movie_id" required class="form-input">
            <option :value="null" disabled>Selecciona película</option>
            <option v-for="m in movies" :key="m.id" :value="m.id">{{ m.title }}</option>
          </select>
          <select v-model.number="castForm.actor_id" required class="form-input">
            <option :value="null" disabled>Selecciona actor</option>
            <option v-for="a in actors" :key="a.id || a.actor_id" :value="a.id || a.actor_id">{{ a.name || a.actor_name }}</option>
          </select>
          <input v-model="castForm.character_name" type="text" placeholder="Nombre del personaje" required class="form-input" />
          <button type="submit" :disabled="creatingCast" class="submit-btn">{{ creatingCast ? 'Creando...' : 'Crear reparto' }}</button>
        </form>
        <div v-if="castsError" class="error">{{ castsError }}</div>
        <div class="items-list">
          <div v-for="c in casts" :key="c.id || (c.movie_id+'-'+c.actor_id)" class="item-row">
            <div class="left">
              <span class="title">{{ c.character_name }}</span>
              <span class="meta">{{ getMovieTitle(c.movie_id) }} · {{ getActorName(c.actor_id) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div v-else class="error">Debes iniciar sesión</div>
</template>

<script>
import moviesService from '../services/moviesService'
import adminService from '../services/adminService'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      activeSection: 'movies',
      movies: [],
      loading: true,
      error: null,
      creating: false,
      form: { title: '', release_date: '', director_id: null, duration: null, synopsis: '', poster: null },
      directors: [],
      directorsError: null,
      creatingDirector: false,
      directorForm: { director_name: '' },
      actors: [],
      actorsError: null,
      creatingActor: false,
      actorForm: { actor_name: '' },
      genres: [],
      genresError: null,
      creatingGenre: false,
      genreForm: { genre_name: '' },
      casts: [],
      castsError: null,
      creatingCast: false,
      castForm: { movie_id: null, actor_id: null, character_name: '' }
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    }
  },
  mounted() {
    this.fetchMovies()
    this.fetchDirectors()
    this.fetchActors()
    this.fetchGenres()
    this.fetchCasts()
  },
  methods: {
    setSection(s) { this.activeSection = s },
    async fetchMovies() {
      try {
        const response = await moviesService.list({ per_page: 20 })
        this.movies = response.data.data || []
      } catch (e) {
        this.error = e.response?.data?.message || e.message
      } finally {
        this.loading = false
      }
    },
    async fetchDirectors() {
      try {
        const response = await adminService.listDirectors({ per_page: 20 })
        this.directors = response.data.data || response.data || []
      } catch (e) {
        this.directorsError = e.response?.data?.message || e.message
      }
    },
    async fetchActors() {
      try {
        const response = await adminService.listActors({ per_page: 20 })
        this.actors = response.data.data || response.data || []
      } catch (e) {
        this.actorsError = e.response?.data?.message || e.message
      }
    },
    async fetchGenres() {
      try {
        const response = await adminService.listGenres({ per_page: 20 })
        this.genres = response.data.data || response.data || []
      } catch (e) {
        this.genresError = e.response?.data?.message || e.message
      }
    },
    async fetchCasts() {
      try {
        const response = await adminService.listCasts({ per_page: 20 })
        this.casts = response.data.data || response.data || []
      } catch (e) {
        this.castsError = e.response?.data?.message || e.message
      }
    },
    async createMovie() {
      this.creating = true
      this.error = null
      try {
        const fd = new FormData()
        fd.append('title', this.form.title)
        fd.append('release_date', this.form.release_date)
        fd.append('director_id', String(this.form.director_id))
        fd.append('duration', String(this.form.duration))
        fd.append('synopsis', this.form.synopsis || '')
        if (this.form.poster) fd.append('poster', this.form.poster)

        await adminService.createMovie(fd)
        this.form = { title: '', release_date: '', director_id: null, duration: null, synopsis: '' }
        this.fetchMovies()
      } catch (e) {
        this.error = e.response?.data?.message || e.message
      } finally {
        this.creating = false
      }
    },
    onPosterChange(e) {
        const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
        this.form.poster = file
    },
    async createDirector() {
      this.creatingDirector = true
      this.directorsError = null
      try {
        await adminService.createDirector(this.directorForm)
        this.directorForm = { director_name: '' }
        this.fetchDirectors()
      } catch (e) {
        this.directorsError = e.response?.data?.message || e.message
      } finally {
        this.creatingDirector = false
      }
    },
    async createActor() {
      this.creatingActor = true
      this.actorsError = null
      try {
        await adminService.createActor(this.actorForm)
        this.actorForm = { actor_name: '' }
        this.fetchActors()
      } catch (e) {
        this.actorsError = e.response?.data?.message || e.message
      } finally {
        this.creatingActor = false
      }
    },
    async createGenre() {
      this.creatingGenre = true
      this.genresError = null
      try {
        await adminService.createGenre(this.genreForm)
        this.genreForm = { genre_name: '' }
        this.fetchGenres()
      } catch (e) {
        this.genresError = e.response?.data?.message || e.message
      } finally {
        this.creatingGenre = false
      }
    },
    async createCast() {
      this.creatingCast = true
      this.castsError = null
      try {
        await adminService.createMovieCast(this.castForm)
        this.castForm = { movie_id: null, actor_id: null, character_name: '' }
        this.fetchCasts()
      } catch (e) {
        this.castsError = e.response?.data?.message || e.message
      } finally {
        this.creatingCast = false
      }
    },
    async deleteMovie(id) {
      try {
        await adminService.deleteMovie(id)
        this.movies = this.movies.filter((m) => m.id !== id)
      } catch (e) {
        this.error = e.response?.data?.message || e.message
      }
    },
    formatDate(dateString) {
      const d = new Date(dateString)
      return d.toLocaleDateString()
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
.admin-layout { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; color: #fff; }
.sidebar { background: linear-gradient(135deg, #1f2530 0%, #14181c 100%); border-right: 1px solid rgba(255,255,255,0.08); padding: 1rem; }
.sidebar-header { color: #00d4aa; font-weight: 700; margin-bottom: 1rem; }
.sidebar-item { width: 100%; text-align: left; background: transparent; border: none; color: #cbd5e1; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; }
.sidebar-item.active { background: rgba(0,212,170,0.12); color: #00d4aa; }
.admin-content { padding: 2rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
.form-input { padding: 0.75rem 1rem; border: 2px solid #3a4553; border-radius: 10px; background-color: rgba(26, 32, 44, 0.8); color: #fff; }
.submit-btn { background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); color: #14181c; border: none; padding: 0.75rem 1rem; border-radius: 10px; font-weight: 700; }
.items-list { display: flex; flex-direction: column; gap: 0.5rem; }
.item-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border: 1px solid #3a4553; border-radius: 10px; }
.left .title { font-weight: 600; }
.left .meta { color: #9ab; margin-left: 0.5rem; }
.delete-btn { background: linear-gradient(135deg, #3a4553 0%, #4a5563 100%); color: #9ab; border: none; padding: 0.5rem 0.75rem; border-radius: 10px; }
.error { color: #ff6b6b; margin-top: 1rem; }
</style>
