import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    nav: {
      home: 'Home',
      login: 'Login',
      register: 'Register',
      profile: 'Profile'
    },
    header: {
      title: 'Letterboxd UAM',
      subtitle: 'Discover and review movies'
    },
    auth: {
      login: {
        title: 'Login',
        email: 'Email',
        password: 'Password',
        submit: 'Login',
        loading: 'Logging in...',
        link: 'Don\'t have an account?',
        linkText: 'Register here'
      },
      register: {
        title: 'Register',
        username: 'Username',
        name: 'Name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        submit: 'Register',
        loading: 'Registering...',
        link: 'Already have an account?',
        linkText: 'Login here'
      }
    },
    movie: {
      loading: 'Loading movie details...',
      error: 'Failed to load movie details',
      directedBy: 'Directed by',
      duration: 'Duration',
      averageRating: 'Average Rating',
      totalReviews: 'Total Reviews',
      writeReview: 'WRITE REVIEW',
      editReview: 'EDIT REVIEW',
      cast: 'Cast',
      statistics: 'Statistics',
      reviews: 'Reviews',
      noReviews: 'No reviews yet. Be the first to review this movie!',
      by: 'By'
    },
    review: {
      write: 'Write a Review',
      edit: 'Edit Review',
      rating: 'Rating (1-5 stars)',
      comment: 'Comment (optional)',
      placeholder: 'Share your thoughts about this movie...',
      cancel: 'Cancel',
      submit: 'Submit Review',
      update: 'Update Review',
      submitting: 'Submitting...'
    },
    common: {
      loading: 'Loading movies...',
      error: 'Error loading movies',
      reviews: 'reviews'
    },
    profile: {
      title: 'My Profile',
      loading: 'Loading profile...',
      edit: 'Edit',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      editProfile: 'Edit Profile',
      personalInfo: 'Personal Information',
      name: 'Name',
      username: 'Username',
      email: 'Email',
      memberSince: 'Member since',
      activity: 'Activity',
      reviewsWritten: 'Reviews written',
      averageRating: 'Average rating'
    }
  },
  es: {
    nav: {
      home: 'Inicio',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      profile: 'Perfil'
    },
    header: {
      title: 'Letterboxd UAM',
      subtitle: 'Descubre y reseña películas'
    },
    auth: {
      login: {
        title: 'Iniciar Sesión',
        email: 'Correo electrónico',
        password: 'Contraseña',
        submit: 'Iniciar Sesión',
        loading: 'Iniciando sesión...',
        link: '¿No tienes una cuenta?',
        linkText: 'Regístrate aquí'
      },
      register: {
        title: 'Registrarse',
        name: 'Nombre',
        username: 'Usuario',
        email: 'Correo electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        submit: 'Registrarse',
        loading: 'Registrando...',
        link: '¿Ya tienes una cuenta?',
        linkText: 'Inicia sesión aquí'
      }
    },
    movie: {
      loading: 'Cargando detalles de la película...',
      error: 'Error al cargar los detalles de la película',
      directedBy: 'Dirigida por',
      duration: 'Duración',
      averageRating: 'Calificación Promedio',
      totalReviews: 'Total de Reseñas',
      writeReview: 'Escribir Reseña',
      editReview: 'Editar Reseña',
      cast: 'Reparto',
      statistics: 'Estadísticas',
      reviews: 'Reseñas',
      noReviews: 'Aún no hay reseñas. ¡Sé el primero en reseñar esta película!',
      by: 'Por'
    },
    review: {
      write: 'Escribir una Reseña',
      edit: 'Editar Reseña',
      rating: 'Calificación (1-5 estrellas)',
      comment: 'Comentario (opcional)',
      placeholder: 'Comparte tus pensamientos sobre esta película...',
      cancel: 'Cancelar',
      submit: 'Enviar Reseña',
      update: 'Actualizar Reseña',
      submitting: 'Enviando...'
    },
    common: {
      loading: 'Cargando películas...',
      error: 'Error al cargar películas',
      reviews: 'reseñas'
    },
    profile: {
      title: 'Mi Perfil',
      loading: 'Cargando perfil...',
      edit: 'Editar',
      cancel: 'Cancelar',
      save: 'Guardar',
      saving: 'Guardando...',
      editProfile: 'Editar Perfil',
      personalInfo: 'Información Personal',
      name: 'Nombre',
      username: 'Usuario',
      email: 'Correo electrónico',
      memberSince: 'Miembro desde',
      activity: 'Actividad',
      reviewsWritten: 'Reseñas escritas',
      averageRating: 'Calificación promedio'
    }
  }
}

const i18n = createI18n({
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages
})

export default i18n