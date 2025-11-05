import { createRouter, createWebHistory } from 'vue-router'
import Home from '../App.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import MovieDetail from '../components/MovieDetail.vue'

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
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router