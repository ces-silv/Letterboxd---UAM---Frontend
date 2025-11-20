import { createRouter, createWebHistory } from 'vue-router'
import Home from '../App.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import MovieDetail from '../components/MovieDetail.vue'
import Profile from '../components/Profile.vue'
import AdminDashboard from '../components/AdminDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: MovieDetail,
    props: (route) => ({
      movieId: route.params.id
    })
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  }
  ,
  {
    path: '/admin',
    name: 'Admin',
    component: AdminDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router