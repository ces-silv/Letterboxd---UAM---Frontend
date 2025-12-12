import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    nav: {
      home: 'Home',
      login: 'Login',
      register: 'Register',
      profile: 'Profile',
      admin: 'Admin'
    },
    admin: {
      header: { title: 'Admin Panel' },
      mustLogin: 'You must log in',
      sidebar: {
        movies: 'Movies',
        directors: 'Directors',
        actors: 'Actors',
        genres: 'Genres',
        casts: 'Cast'
      },
      movies: {
        title: 'Movies',
        new: 'New movie',
        edit: 'Edit',
        delete: 'Delete',
        modal: {
          createTitle: 'New movie',
          editTitle: 'Edit movie',
          createSubmit: 'Create movie',
          editSubmit: 'Update movie',
          creating: 'Creating...',
          updating: 'Updating...'
        },
        deleteModal: {
          title: 'Delete movie',
          confirm: 'Are you sure you want to delete “{title}”?',
          cancel: 'Cancel',
          deleting: 'Deleting...',
          delete: 'Delete'
        },
        toast: {
          created: 'Movie created successfully',
          updated: 'Movie updated successfully',
          deleted: 'Movie deleted successfully'
        }
      },
      directors: {
        title: 'Directors',
        placeholder: 'Director name',
        create: 'Create director',
        creating: 'Creating...',
        deleteModal: {
          title: 'Delete director',
          confirm: 'Are you sure you want to delete “{name}”?',
          cancel: 'Cancel',
          deleting: 'Deleting...',
          delete: 'Delete'
        },
        toast: {
          created: 'Director created successfully',
          deleted: 'Director deleted successfully'
        }
      },
      actors: {
        title: 'Actors',
        placeholder: 'Actor name',
        create: 'Create actor',
        creating: 'Creating...',
        toast: {
          created: 'Actor created successfully'
        }
      },
      genres: {
        title: 'Genres',
        placeholder: 'Genre name',
        create: 'Create genre',
        creating: 'Creating...',
        toast: {
          created: 'Genre created successfully'
        }
      },
      casts: {
        title: 'Cast',
        selectMovie: 'Select movie',
        selectActor: 'Select actor',
        placeholderCharacter: 'Character name',
        create: 'Create cast',
        creating: 'Creating...',
        toast: {
          created: 'Cast created successfully'
        }
      }
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
      loginToReview: 'Login to review',
      logout: 'Logout',
      register: {
        title: 'Register',
        username: 'Username',
        name: 'Name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        passwordsMatch: 'Passwords match',
        passwordsNoMatch: 'Passwords do not match',
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
      by: 'By',
      deleteReview: "Delete Review"
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
      reviews: 'reviews',
      show: 'Show',
      hide: 'Hide'
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
      averageRating: 'Average rating',
      myReviews: 'My Reviews',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      passwordChanged: 'Password changed successfully'
    }
  },
  es: {
    nav: {
      home: 'Inicio',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      profile: 'Perfil',
      admin: 'Administración'
    },
    admin: {
      header: { title: 'Panel Administrativo' },
      mustLogin: 'Debes iniciar sesión',
      sidebar: {
        movies: 'Películas',
        directors: 'Directores',
        actors: 'Actores',
        genres: 'Géneros',
        casts: 'Reparto'
      },
      movies: {
        title: 'Películas',
        new: 'Nueva película',
        edit: 'Editar',
        delete: 'Eliminar',
        modal: {
          createTitle: 'Nueva película',
          editTitle: 'Editar película',
          createSubmit: 'Crear película',
          editSubmit: 'Actualizar película',
          creating: 'Creando...',
          updating: 'Actualizando...'
        },
        deleteModal: {
          title: 'Eliminar película',
          confirm: '¿Seguro que deseas eliminar “{title}”?',
          cancel: 'Cancelar',
          deleting: 'Eliminando...',
          delete: 'Eliminar'
        },
        toast: {
          created: 'Película creada exitosamente',
          updated: 'Película actualizada exitosamente',
          deleted: 'Película eliminada exitosamente'
        }
      },
      directors: {
        title: 'Directores',
        placeholder: 'Nombre del director',
        create: 'Crear director',
        creating: 'Creando...',
        deleteModal: {
          title: 'Eliminar director',
          confirm: '¿Seguro que deseas eliminar “{name}”?',
          cancel: 'Cancelar',
          deleting: 'Eliminando...',
          delete: 'Eliminar'
        },
        toast: {
          created: 'Director creado exitosamente',
          deleted: 'Director eliminado exitosamente'
        }
      },
      actors: {
        title: 'Actores',
        placeholder: 'Nombre del actor',
        create: 'Crear actor',
        creating: 'Creando...',
        toast: {
          created: 'Actor creado exitosamente'
        }
      },
      genres: {
        title: 'Géneros',
        placeholder: 'Nombre del género',
        create: 'Crear género',
        creating: 'Creando...',
        toast: {
          created: 'Género creado exitosamente'
        }
      },
      casts: {
        title: 'Reparto',
        selectMovie: 'Selecciona película',
        selectActor: 'Selecciona actor',
        placeholderCharacter: 'Nombre del personaje',
        create: 'Crear reparto',
        creating: 'Creando...',
        toast: {
          created: 'Reparto creado exitosamente'
        }
      }
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
      loginToReview: 'Inicia sesión para reseñar',
      logout: 'Cerrar sesión',
      register: {
        title: 'Registrarse',
        name: 'Nombre',
        username: 'Usuario',
        email: 'Correo electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        passwordsMatch: 'Las contraseñas coinciden',
        passwordsNoMatch: 'Las contraseñas no coinciden',
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
      by: 'Por',
      deleteReview: "Eliminar Reseña"
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
      reviews: 'reseñas',
      show: 'Mostrar',
      hide: 'Ocultar'
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
      averageRating: 'Calificación promedio',
      myReviews: 'Mis reseñas',
      changePassword: 'Cambiar contraseña',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      passwordChanged: 'Contraseña cambiada exitosamente'
    }
  }
}

const i18n = createI18n({
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages
})

export default i18n
